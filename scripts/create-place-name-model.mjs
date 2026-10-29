import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const backupDirectory = path.join(root, "data", "backups");
const db = new DatabaseSync(databasePath);
const columns = new Set(db.prepare("PRAGMA table_info(places)").all().map(({ name }) => name));

if (columns.has("name")) {
  db.close();
  console.log("Модель имён уже создана.");
  process.exit(0);
}

await mkdir(backupDirectory, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backup = path.join(backupDirectory, `before-place-name-model-${stamp}.sqlite`);
await copyFile(databasePath, backup);

const types = new Map([
  ["деревня", "village"], ["полдеревни", "village"], ["починок", "pochinok"], ["пустошь", "pustosh"],
  ["селище", "selishche"], ["погост", "pogost"], ["новцо", "novtso"], ["займище", "zaimishche"]
]);
const typePrefix = /^(деревня|деревни|полдеревни|полдеревня|починок|пустошь|пустоши|селище|селища|погост|новцо|займище)\s*,?\s*/iu;
const cleanName = (value) => String(value)
  .trim()
  .replace(/^\[(.+)\]$/u, "$1")
  .replace(/^\[(?:деревня|починок|пустошь|селище|погост|новцо)\]\s*/iu, "")
  .replace(/\[[^\]]*\]/gu, "")
  .replace(typePrefix, "")
  .replace(/^что\s+(?:была|было|был|были)\s+(?:деревня|починок|пустошь|селище|погост)\s+/iu, "")
  .replace(/,\s*что\s+(?:была|было|был|были)\s+(?:деревня|починок|пустошь|селище|погост|займище)\s+.+$/iu, "")
  .replace(/\s+на\s+(?:реке|речке|ручье|ручью)(?=\s|$|[,.])[\s\S]*$/iu, "")
  .replace(/\s+на\s+(?:Шексне|Шехсне|Уломе)(?=$|[,.])[\s\S]*$/iu, "")
  .replace(/\s+(?:на\s+)?пуст(?:а|ая|ое|ой|ои)(?=$|[,.])[\s\S]*$/iu, "")
  .replace(/,\s*[^,]+?\s+тож(?=$|[,.])/iu, "")
  .replace(/[,\.\s]+$/u, "")
  .trim();
const sourceType = (value) => types.get(String(value).trim().toLocaleLowerCase("ru-RU").match(/^(деревня|полдеревни|починок|пустошь|селище|погост|новцо|займище)/u)?.[1]) ?? null;
const editorialNameOverrides = new Map([
  ["igumnovo", "Игумново"],
  ["ilinskaya", "Ильинская"]
]);

db.exec("BEGIN IMMEDIATE");
try {
  db.exec(`
    ALTER TABLE places ADD COLUMN name TEXT;
    ALTER TABLE places ADD COLUMN name_origin TEXT;
    CREATE TABLE place_name_states (
      id TEXT PRIMARY KEY,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      place_name_id TEXT NOT NULL REFERENCES place_names(id) ON DELETE CASCADE,
      type_code TEXT REFERENCES place_types(code),
      source_mention_id TEXT REFERENCES mentions(id) ON DELETE SET NULL,
      observed_year TEXT,
      display_period TEXT,
      assertion_kind TEXT NOT NULL CHECK (assertion_kind IN ('observed', 'inferred', 'editorial')),
      position INTEGER NOT NULL
    );
    CREATE INDEX place_name_states_place_idx ON place_name_states(place_id, position);
  `);

  const existingNames = new Map(db.prepare("SELECT id, place_id, name FROM place_names").all()
    .map((row) => [`${row.place_id}\u0000${row.name.toLocaleLowerCase("ru-RU")}`, row.id]));
  const addName = db.prepare(`INSERT INTO place_names
    (id, place_id, name, language, name_kind) VALUES (?, ?, ?, 'ru', ?)`);
  const nameId = (placeId, name, kind) => {
    const key = `${placeId}\u0000${name.toLocaleLowerCase("ru-RU")}`;
    const current = existingNames.get(key);
    if (current) return current;
    const id = `${kind}:${placeId}:${existingNames.size}`;
    addName.run(id, placeId, name, kind);
    existingNames.set(key, id);
    return id;
  };
  const addState = db.prepare(`INSERT INTO place_name_states
    (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const mentions = db.prepare(`
    SELECT m.id, m.place_id, m.source_name, m.historical_name_override, m.rowid AS mention_order, b.year
    FROM mentions m JOIN fragments f ON f.id = m.fragment_id JOIN books b ON b.id = f.book_id
    ORDER BY CAST(substr(b.year, 1, 4) AS INTEGER) DESC, m.rowid ASC
  `).all();
  const firstObserved = new Map();
  const positions = new Map();
  for (const mention of mentions) {
    const source = mention.historical_name_override ?? mention.source_name;
    const name = editorialNameOverrides.get(mention.place_id) ?? cleanName(source);
    if (!name) continue;
    const position = positions.get(mention.place_id) ?? 0;
    positions.set(mention.place_id, position + 1);
    const id = nameId(mention.place_id, name, "attested");
    addState.run(`observed:${mention.id}`, mention.place_id, id, sourceType(source), mention.id, mention.year, mention.year, "observed", position);
    if (!firstObserved.has(mention.place_id)) firstObserved.set(mention.place_id, name);
    const former = /^(?:деревня|починок|пустошь|селище|погост)\s*,?\s*что\s+(?:была|было|был|были)\s+(деревня|починок|пустошь|селище|погост)\s+(.+)$/iu.exec(source);
    if (former) {
      const formerName = cleanName(former[2]);
      const formerId = nameId(mention.place_id, formerName, "attested");
      addState.run(`inferred:${mention.id}`, mention.place_id, formerId, types.get(former[1].toLocaleLowerCase("ru-RU")) ?? null, mention.id, null, `до ${mention.year}`, "inferred", position + 1000);
    }
  }
  const setMain = db.prepare("UPDATE places SET name = ?, name_origin = ? WHERE id = ?");
  for (const place of db.prepare("SELECT id, preferred_name, main_name FROM places").all()) {
    const editorial = place.main_name?.trim();
    const name = editorial || firstObserved.get(place.id) || place.preferred_name;
    if (!name) throw new Error(`Не найдено главное имя для ${place.id}.`);
    if (editorial && editorial !== firstObserved.get(place.id)) {
      const id = nameId(place.id, editorial, "editorial");
      const position = positions.get(place.id) ?? 0;
      addState.run(`editorial:${place.id}`, place.id, id, null, null, null, null, "editorial", position + 2000);
    }
    if (place.preferred_name && place.preferred_name !== name) nameId(place.id, place.preferred_name, "legacy_preferred");
    setMain.run(name, editorial ? "editorial" : "observed", place.id);
  }
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}

console.log(`Создана модель имён. Резервная копия: ${backup}`);
