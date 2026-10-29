import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const backupDirectory = path.join(root, "data", "backups");
const db = new DatabaseSync(databasePath);
const exists = db.prepare("PRAGMA table_info(mentions)").all().some(({ name }) => name === "target_anchor");

if (!exists) {
  db.close();
  console.log("Столбец target_anchor уже удалён.");
  process.exit(0);
}

await mkdir(backupDirectory, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupFile = path.join(backupDirectory, `before-remove-target-anchor-${stamp}.sqlite`);
await copyFile(databasePath, backupFile);
db.exec("BEGIN IMMEDIATE");
try {
  db.exec("UPDATE mentions SET raw_json = json_remove(raw_json, '$.target_anchor')");
  db.exec("DROP INDEX IF EXISTS mentions_target_anchor_idx");
  db.exec("ALTER TABLE mentions DROP COLUMN target_anchor");
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
console.log(`Столбец target_anchor удалён. Резервная копия: ${path.relative(root, backupFile)}`);
