import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const backupDirectory = path.join(root, "data", "backups");
const db = new DatabaseSync(databasePath);
const hasLegacyTable = db.prepare(
  "SELECT 1 FROM sqlite_master WHERE type = ? AND name = ?"
).get("table", "place_name_variants");

if (!hasLegacyTable) {
  db.close();
  console.log("Таблица place_name_variants уже удалена.");
  process.exit(0);
}

await mkdir(backupDirectory, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupFile = path.join(backupDirectory, `before-remove-place-name-variants-${stamp}.sqlite`);
await copyFile(databasePath, backupFile);

const legacyRows = db.prepare(
  "SELECT place_id, position, name FROM place_name_variants ORDER BY place_id, position"
).all();
const findName = db.prepare("SELECT id FROM place_names WHERE place_id = ? AND name = ?");
const insertName = db.prepare(`
  INSERT INTO place_names (id, place_id, name, language, name_kind)
  VALUES (?, ?, ?, 'ru', 'historical')
`);
let copied = 0;
db.exec("BEGIN IMMEDIATE");
try {
  for (const row of legacyRows) {
    if (findName.get(row.place_id, row.name)) continue;
    insertName.run(`legacy-variant:${row.place_id}:${row.position}`, row.place_id, row.name);
    copied += 1;
  }
  db.exec("DROP TABLE place_name_variants");
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}

console.log(`Перенесено вариантов имён: ${copied}. Таблица place_name_variants удалена. Резервная копия: ${path.relative(root, backupFile)}`);
