import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const backupDirectory = path.join(root, "data", "backups");
const db = new DatabaseSync(databasePath);
const exists = db.prepare("SELECT 1 FROM sqlite_master WHERE type = ? AND name = ?").get("table", "mention_name_variants");
if (!exists) {
  db.close();
  console.log("Таблица mention_name_variants уже удалена.");
  process.exit(0);
}

await mkdir(backupDirectory, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupFile = path.join(backupDirectory, `before-migrate-mention-name-variants-${stamp}.sqlite`);
await copyFile(databasePath, backupFile);

const typeCodes = new Map(db.prepare("SELECT label, code FROM place_types").all()
  .map(({ label, code }) => [label.toLocaleLowerCase("ru-RU"), code]));
const rows = db.prepare(`
  SELECT variants.mention_id, variants.position, variants.name, mentions.place_id, books.year
  FROM mention_name_variants AS variants
  JOIN mentions ON mentions.id = variants.mention_id
  JOIN fragments ON fragments.id = mentions.fragment_id
  JOIN books ON books.id = fragments.book_id
  ORDER BY variants.mention_id, variants.position
`).all();
const knownNames = new Map(db.prepare("SELECT id, place_id, name FROM place_names").all()
  .map(({ id, place_id, name }) => [`${place_id}\u0000${name.toLocaleLowerCase("ru-RU")}`, id]));
const insertName = db.prepare(`INSERT INTO place_names
  (id, place_id, name, language, name_kind, source_mention_id)
  VALUES (?, ?, ?, 'ru', 'attested', ?)`);
const insertState = db.prepare(`INSERT OR IGNORE INTO place_name_states
  (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'observed', ?)`);
const maxPosition = db.prepare("SELECT COALESCE(MAX(position), -1) AS value FROM place_name_states WHERE place_id = ?");
const positions = new Map();
const nameId = (placeId, name, mentionId, position) => {
  const key = `${placeId}\u0000${name.toLocaleLowerCase("ru-RU")}`;
  if (knownNames.has(key)) return knownNames.get(key);
  const id = `mention-variant:${mentionId}:${position}`;
  insertName.run(id, placeId, name, mentionId);
  knownNames.set(key, id);
  return id;
};

let migrated = 0;
db.exec("BEGIN IMMEDIATE");
try {
  for (const row of rows) {
    const match = /^(деревня|деревни|пустошь|пустоши|починок|селище|новцо)\s+(.+)$/iu.exec(row.name);
    if (!match) throw new Error(`Не удалось разобрать вариант ${row.mention_id}: ${row.name}`);
    const type = match[1].toLocaleLowerCase("ru-RU");
    const name = match[2].trim();
    const nextPosition = positions.get(row.place_id) ?? maxPosition.get(row.place_id).value + 1;
    positions.set(row.place_id, nextPosition + 1);
    insertState.run(`observed:${row.mention_id}:variant:${row.position}`, row.place_id,
      nameId(row.place_id, name, row.mention_id, row.position), typeCodes.get(type) ?? null,
      row.mention_id, row.year, row.year, nextPosition);
    migrated += 1;
  }
  db.exec("UPDATE mentions SET raw_json = json_remove(raw_json, '$.historical_name_variants')");
  db.exec("DROP TABLE mention_name_variants");
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
console.log(`Перенесено вариантов имён: ${migrated}. Резервная копия: ${path.relative(root, backupFile)}`);
