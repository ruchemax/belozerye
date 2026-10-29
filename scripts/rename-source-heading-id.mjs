import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const backupDirectory = path.join(root, "data", "backups");
const db = new DatabaseSync(databasePath);
const columns = new Set(db.prepare("PRAGMA table_info(fragments)").all().map(({ name }) => name));

if (columns.has("source_heading_id")) {
  db.close();
  console.log("Столбец source_heading_id уже существует.");
  process.exit(0);
}
if (!columns.has("heading_id")) throw new Error("В fragments не найден столбец heading_id.");

await mkdir(backupDirectory, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupFile = path.join(backupDirectory, `before-rename-source-heading-id-${stamp}.sqlite`);
await copyFile(databasePath, backupFile);
db.exec("BEGIN IMMEDIATE");
try {
  db.exec("ALTER TABLE fragments RENAME COLUMN heading_id TO source_heading_id");
  db.exec("UPDATE fragments SET raw_json = json_remove(json_set(raw_json, '$.source_heading_id', source_heading_id), '$.heading_id')");
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
console.log(`Столбец heading_id переименован в source_heading_id. Резервная копия: ${path.relative(root, backupFile)}`);
