import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const db = new DatabaseSync(databasePath);
if (!db.prepare("PRAGMA table_info(places)").all().some(({ name }) => name === "source_book_id")) {
  db.close();
  console.log("Столбец source_book_id уже удалён.");
  process.exit(0);
}
const backupDirectory = path.join(root, "data", "backups");
await mkdir(backupDirectory, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupFile = path.join(backupDirectory, `before-remove-source-book-id-${stamp}.sqlite`);
await copyFile(databasePath, backupFile);
db.exec("PRAGMA foreign_keys = OFF");
db.exec("BEGIN IMMEDIATE");
try {
  db.exec(`
    CREATE TABLE places_new (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      name_origin TEXT,
      type_code TEXT NOT NULL REFERENCES place_types(code),
      status_code TEXT NOT NULL REFERENCES place_statuses(code),
      raw_json TEXT NOT NULL
    );
    INSERT INTO places_new (id, slug, name, name_origin, type_code, status_code, raw_json)
    SELECT id, slug, name, name_origin, type_code, status_code,
      json_remove(raw_json, '$.source_book_id')
    FROM places;
    DROP TABLE places;
    ALTER TABLE places_new RENAME TO places;
  `);
  db.exec("COMMIT");
  console.log(`source_book_id удалён. Резервная копия: ${path.relative(root, backupFile)}`);
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.exec("PRAGMA foreign_keys = ON");
  db.close();
}
