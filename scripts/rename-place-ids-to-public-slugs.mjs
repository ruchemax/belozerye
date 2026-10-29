import { copyFile, mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const placesPath = path.join(root, "dist", "places");
const backupPath = path.join(root, "data", "backups");

const directories = (await readdir(placesPath, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory());
const mappings = [];
for (const directory of directories) {
  const html = await readFile(path.join(placesPath, directory.name, "index.html"), "utf8");
  const match = html.match(/const activePlaceId = ("(?:[^"\\]|\\.)*");/u);
  if (!match) throw new Error(`В странице places/${directory.name}/ не найден activePlaceId.`);
  mappings.push({ oldId: JSON.parse(match[1]), newId: directory.name });
}

const oldIds = new Set(mappings.map(({ oldId }) => oldId));
const newIds = new Set(mappings.map(({ newId }) => newId));
if (oldIds.size !== mappings.length || newIds.size !== mappings.length) {
  throw new Error("Соответствие ID и каталогов places не является однозначным.");
}

const database = new DatabaseSync(databasePath);
const places = database.prepare("SELECT id FROM places ORDER BY rowid").all();
const databaseIds = new Set(places.map(({ id }) => id));
const missingPages = [...databaseIds].filter((id) => !oldIds.has(id));
const unknownPages = [...oldIds].filter((id) => !databaseIds.has(id));
if (missingPages.length || unknownPages.length) {
  database.close();
  throw new Error(
    `Каталоги не совпадают с базой: без страницы — ${missingPages.join(", ") || "нет"}; ` +
    `без записи — ${unknownPages.join(", ") || "нет"}. Сначала выполните npm.cmd run build.`
  );
}

const changes = mappings.filter(({ oldId, newId }) => oldId !== newId);
if (!changes.length) {
  database.close();
  console.log("Все places.id и places.slug уже совпадают с именами каталогов.");
  process.exit(0);
}

await mkdir(backupPath, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replace(".", "-");
const backupFile = path.join(backupPath, `belozerye-before-place-id-rename-${stamp}.sqlite`);
await copyFile(databasePath, backupFile);

const referenceColumns = [
  ["mentions", "place_id"],
  ["place_geometries", "place_id"],
  ["place_names", "place_id"]
];
const updateReference = new Map(referenceColumns.map(([table, column]) => [
  `${table}.${column}`,
  database.prepare(`UPDATE ${table} SET ${column} = ? WHERE ${column} = ?`)
]));
const updatePlaceToTemporary = database.prepare("UPDATE places SET id = ?, slug = ? WHERE id = ?");
const updatePlaceToFinal = database.prepare("UPDATE places SET id = ?, slug = ? WHERE id = ?");
const updateFragmentTarget = database.prepare("UPDATE fragments SET link_target_id = ? WHERE link_target_id = ?");

const temporaryMappings = changes.map(({ oldId, newId }, index) => ({
  oldId,
  newId,
  temporaryId: `__place_id_rename_${index}__`
}));
const replaceExactStrings = (value, replacements) => {
  if (typeof value === "string") return replacements.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => replaceExactStrings(item, replacements));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceExactStrings(item, replacements)]));
  }
  return value;
};
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

database.exec("PRAGMA foreign_keys = OFF; BEGIN IMMEDIATE;");
try {
  for (const { oldId, temporaryId } of temporaryMappings) {
    for (const statement of updateReference.values()) statement.run(temporaryId, oldId);
    updateFragmentTarget.run(temporaryId, oldId);
    updatePlaceToTemporary.run(temporaryId, temporaryId, oldId);
  }
  for (const { newId, temporaryId } of temporaryMappings) {
    updatePlaceToFinal.run(newId, newId, temporaryId);
    for (const statement of updateReference.values()) statement.run(newId, temporaryId);
    updateFragmentTarget.run(newId, temporaryId);
  }

  const replacements = new Map(changes.map(({ oldId, newId }) => [oldId, newId]));

  const updateGeometryRaw = database.prepare("UPDATE place_geometries SET raw_properties_json = ? WHERE place_id = ?");
  for (const row of database.prepare("SELECT place_id, raw_properties_json FROM place_geometries").all()) {
    const raw = replaceExactStrings(JSON.parse(row.raw_properties_json), replacements);
    raw.place_id = row.place_id;
    updateGeometryRaw.run(JSON.stringify(raw), row.place_id);
  }

  for (const table of ["book_documents", "fragments"]) {
    const key = table === "book_documents" ? "book_id" : "id";
    const column = "html";
    const select = database.prepare(`SELECT ${key}, ${column} FROM ${table}`);
    const update = database.prepare(`UPDATE ${table} SET ${column} = ? WHERE ${key} = ?`);
    for (const row of select.all()) {
      let html = row[column];
      for (const { oldId, newId } of changes) {
        html = html.replace(new RegExp(`(places/)${escapeRegex(oldId)}(/)`, "gu"), `$1${newId}$2`);
      }
      if (html !== row[column]) update.run(html, row[key]);
    }
  }

  database.exec("COMMIT; PRAGMA foreign_keys = ON;");
} catch (error) {
  database.exec("ROLLBACK; PRAGMA foreign_keys = ON;");
  database.close();
  throw error;
}

const violations = database.prepare("PRAGMA foreign_key_check").all();
const remainingTechnicalIds = database.prepare(`
  SELECT id FROM places
  WHERE id LIKE 'place-%' OR id LIKE 'land-record-%'
`).all();
database.close();

if (violations.length) throw new Error(`После переименования нарушены внешние ключи: ${JSON.stringify(violations)}`);
if (remainingTechnicalIds.length) {
  throw new Error(`Остались технические ID: ${remainingTechnicalIds.map(({ id }) => id).join(", ")}`);
}

console.log(`Переименовано записей: ${changes.length}.`);
console.log(`Резервная копия: ${backupFile}`);
