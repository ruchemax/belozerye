import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const backupDirectory = path.join(root, "data", "backups");
const columnsToRemove = ["preserve_historical_name", "exclude_from_names", "context_note", "folio_override"];
const db = new DatabaseSync(databasePath);
const existing = new Set(db.prepare("PRAGMA table_info(mentions)").all().map(({ name }) => name));
const columns = columnsToRemove.filter((column) => existing.has(column));

if (!columns.length) {
  db.close();
  console.log("Устаревшие столбцы mentions уже удалены.");
  process.exit(0);
}

await mkdir(backupDirectory, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupFile = path.join(backupDirectory, `before-remove-legacy-mention-columns-${stamp}.sqlite`);
await copyFile(databasePath, backupFile);

db.exec("BEGIN IMMEDIATE");
try {
  const jsonPaths = columns.map((column) => `'$.${column}'`).join(", ");
  db.exec(`UPDATE mentions SET raw_json = json_remove(raw_json, ${jsonPaths})`);
  for (const column of columns) db.exec(`ALTER TABLE mentions DROP COLUMN "${column}"`);
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}

console.log(`Удалены столбцы mentions: ${columns.join(", ")}. Резервная копия: ${path.relative(root, backupFile)}`);
