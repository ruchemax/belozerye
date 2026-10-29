import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const backupDirectory = path.join(root, "data", "backups");
await mkdir(backupDirectory, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupFile = path.join(backupDirectory, `before-set-all-statuses-unknown-${stamp}.sqlite`);
await copyFile(databasePath, backupFile);

const db = new DatabaseSync(databasePath);
db.exec("BEGIN IMMEDIATE");
try {
  const result = db.prepare(`
    UPDATE places
    SET status_code = 'unknown'
    WHERE status_code <> 'unknown'
  `).run();
  db.exec("COMMIT");
  console.log(`Статус «не установлен» назначен: ${result.changes}. Резервная копия: ${path.relative(root, backupFile)}`);
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
