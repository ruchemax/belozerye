import { copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const migrationsPath = path.join(root, "migrations");
const migrations = (await readdir(migrationsPath))
  .filter((name) => /^\d+_.+\.(?:sql|mjs)$/u.test(name))
  .sort((left, right) => left.localeCompare(right, "en"));
const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

for (const migration of migrations) {
  if (db.prepare("SELECT 1 FROM schema_migrations WHERE id = ?").get(migration)) continue;
  const backupDirectory = path.join(root, "data", "backups");
  await mkdir(backupDirectory, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const backupFile = path.join(backupDirectory, `before-${migration.replace(/\.sql$/u, "")}-${stamp}.sqlite`);
  await copyFile(databasePath, backupFile);
  db.exec("BEGIN IMMEDIATE");
  try {
    if (migration.endsWith(".sql")) {
      db.exec(await readFile(path.join(migrationsPath, migration), "utf8"));
    } else {
      const { up } = await import(pathToFileURL(path.join(migrationsPath, migration)).href);
      if (typeof up !== "function") throw new Error(`В миграции ${migration} нет функции up.`);
      await up(db);
    }
    db.prepare("INSERT INTO schema_migrations (id) VALUES (?)").run(migration);
    db.exec("COMMIT");
    console.log(`Применена миграция ${migration}. Резервная копия: ${path.relative(root, backupFile)}`);
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
db.close();
