import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const backupDirectory = path.join(root, "data", "backups");
const db = new DatabaseSync(databasePath);
const typePattern = "(?:деревня|деревни|полдеревни|полдеревня|пустошь|пустоши|пустош|селище|селища|починок|новцо|займище)";
const typeCodes = new Map(db.prepare("SELECT code, label FROM place_types").all()
  .map(({ code, label }) => [label.toLocaleLowerCase("ru-RU"), code]));
const nameRows = db.prepare("SELECT id, place_id, name FROM place_names").all();
const names = new Map(nameRows
  .map(({ id, place_id, name }) => [`${place_id}\u0000${name.toLocaleLowerCase("ru-RU")}`, id]));
const stripSettlementType = (name) => String(name)
  .replace(new RegExp(`^${typePattern}\\s+`, "iu"), "")
  .trim();
const knownNamesByPlace = new Map();
for (const row of nameRows) {
  const values = knownNamesByPlace.get(row.place_id) ?? new Set();
  values.add(stripSettlementType(row.name).toLocaleLowerCase("ru-RU"));
  knownNamesByPlace.set(row.place_id, values);
}
const ensureName = db.prepare(`INSERT INTO place_names
  (id, place_id, name, language, name_kind) VALUES (?, ?, ?, 'ru', 'historical')`);
const updateState = db.prepare("UPDATE place_name_states SET place_name_id = ?, type_code = ?, display_period = ?, assertion_kind = ? WHERE id = ?");
const insertState = db.prepare(`INSERT OR IGNORE INTO place_name_states
  (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const updatePlace = db.prepare("UPDATE places SET name = ? WHERE id = ?");

const nameId = (placeId, name, seed) => {
  const key = `${placeId}\u0000${name.toLocaleLowerCase("ru-RU")}`;
  if (names.has(key)) return names.get(key);
  const id = `normalized:${seed}`;
  ensureName.run(id, placeId, name);
  names.set(key, id);
  return id;
};

await mkdir(backupDirectory, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupFile = path.join(backupDirectory, `before-normalize-place-name-states-${stamp}.sqlite`);
await copyFile(databasePath, backupFile);

const states = db.prepare(`
  SELECT states.*, names.name, places.name AS place_name,
    mentions.source_name, mentions.historical_name_override
  FROM place_name_states AS states
  JOIN place_names AS names ON names.id = states.place_name_id
  JOIN places ON places.id = states.place_id
  LEFT JOIN mentions ON mentions.id = states.source_mention_id
`).all();
let changed = 0;
db.exec("BEGIN IMMEDIATE");
try {
  for (const state of states) {
    // An explicit historical override is curated data. It takes precedence over
    // brackets and administrative wording embedded in the diplomatic source name.
    const override = new RegExp(`^(${typePattern})\\s+(.+)$`, "iu")
      .exec(state.historical_name_override ?? "");
    if (override) {
      const type = override[1].toLocaleLowerCase("ru-RU");
      const name = override[2].trim();
      const typeCode = typeCodes.get(type) ?? state.type_code;
      if (state.name !== name || state.type_code !== typeCode) {
        updateState.run(nameId(state.place_id, name, `${state.id}:override`), typeCode,
          state.display_period, state.assertion_kind, state.id);
        if (state.place_name === state.name) updatePlace.run(name, state.place_id);
        changed += 1;
      }
      continue;
    }

    // A comma-separated source form may name the same settlement twice. Split
    // it only when both sides are independently known names for that place.
    const pairedNames = new RegExp(`^${typePattern}\\s+(.+?),\\s+(.+)$`, "iu")
      .exec(state.source_name ?? "");
    if (pairedNames) {
      const first = pairedNames[1].trim();
      const second = pairedNames[2].trim();
      const known = knownNamesByPlace.get(state.place_id) ?? new Set();
      if (known.has(first.toLocaleLowerCase("ru-RU")) && known.has(second.toLocaleLowerCase("ru-RU"))) {
        const firstId = nameId(state.place_id, first, `${state.id}:first`);
        updateState.run(firstId, state.type_code, state.display_period, state.assertion_kind, state.id);
        insertState.run(`${state.id}:paired`, state.place_id,
          nameId(state.place_id, second, `${state.id}:paired`), state.type_code,
          state.source_mention_id, state.observed_year, state.display_period, state.assertion_kind, state.position + 1);
        if (state.place_name === state.name) updatePlace.run(first, state.place_id);
        changed += 1;
        continue;
      }
    }

    const bracketed = /\s+\[([^\]]+)\]/u.exec(state.source_name ?? "");
    if (bracketed && state.name !== bracketed[1].trim()) {
      const name = bracketed[1].trim();
      updateState.run(nameId(state.place_id, name, `${state.id}:bracketed`), state.type_code, state.display_period, state.assertion_kind, state.id);
      if (state.place_name === state.name) updatePlace.run(name, state.place_id);
      changed += 1;
    }

    const localContext = new RegExp(`^${typePattern}\\s+(.+?)\\s+у\\s+[А-ЯЁ][\\p{L}-]*$`, "iu").exec(state.source_name ?? "");
    if (localContext && state.name !== localContext[1].trim()) {
      const name = localContext[1].trim();
      updateState.run(nameId(state.place_id, name, `${state.id}:local-context`), state.type_code, state.display_period, state.assertion_kind, state.id);
      if (state.place_name === state.name) updatePlace.run(name, state.place_id);
      changed += 1;
    }

    const former = new RegExp(`^что\\s+(?:было|была|был|были)\\s+(${typePattern})\\s+(.+)$`, "iu").exec(state.name);
    if (former) {
      const formerType = former[1].toLocaleLowerCase("ru-RU");
      const name = former[2].trim();
      const currentNameId = nameId(state.place_id, name, `${state.id}:current`);
      const formerNameId = nameId(state.place_id, name, `${state.id}:former`);
      const period = state.display_period ?? state.observed_year;
      updateState.run(currentNameId, state.type_code, state.display_period, state.assertion_kind, state.id);
      insertState.run(`${state.id}:former`, state.place_id, formerNameId, typeCodes.get(formerType) ?? state.type_code,
        state.source_mention_id, null, period ? `до ${period}` : null, "inferred", state.position);
      if (state.place_name === state.name) updatePlace.run(name, name, state.place_id);
      changed += 1;
      continue;
    }

    const alternative = /^(.*?),\s*(?:а\s+)?(?:зовут|называют)\s+(.+)$/iu.exec(state.name);
    if (!alternative) continue;
    const first = alternative[1].trim();
    const second = alternative[2].trim();
    updateState.run(nameId(state.place_id, first, `${state.id}:first`), state.type_code, state.display_period, state.assertion_kind, state.id);
    insertState.run(`${state.id}:alternative`, state.place_id, nameId(state.place_id, second, `${state.id}:alternative`), state.type_code,
      state.source_mention_id, state.observed_year, state.display_period, state.assertion_kind, state.position);
    if (state.place_name === state.name) updatePlace.run(first, first, state.place_id);
    changed += 1;
  }

  // A main name that is already recorded by a sourced observed state is not
  // editorial.  The initial migration used to add a duplicate editorial state
  // for these normalized forms (for example, Chyuravskaya Nov).
  const duplicateEditorialStates = db.prepare(`
    SELECT editorial.id, editorial.place_id, editorial.place_name_id AS editorial_name_id,
      observed.place_name_id AS observed_name_id, observed.source_mention_id
    FROM place_name_states AS editorial
    JOIN place_names AS editorial_name ON editorial_name.id = editorial.place_name_id
    JOIN place_name_states AS observed
      ON observed.place_id = editorial.place_id
     AND observed.assertion_kind = 'observed'
     AND observed.source_mention_id IS NOT NULL
    JOIN place_names AS observed_name ON observed_name.id = observed.place_name_id
     AND lower(observed_name.name) = lower(editorial_name.name)
    WHERE editorial.assertion_kind = 'editorial'
  `).all();
  const reclassifyName = db.prepare("UPDATE place_names SET name_kind = 'attested' WHERE id = ?");
  const deleteState = db.prepare("DELETE FROM place_name_states WHERE id = ?");
  const deleteName = db.prepare("DELETE FROM place_names WHERE id = ?");
  const setNameOrigin = db.prepare("UPDATE places SET name_origin = 'observed' WHERE id = ?");
  for (const state of duplicateEditorialStates) {
    reclassifyName.run(state.observed_name_id);
    deleteState.run(state.id);
    if (state.editorial_name_id !== state.observed_name_id) deleteName.run(state.editorial_name_id);
    setNameOrigin.run(state.place_id);
    changed += 1;
  }

  // Diplomatic punctuation belongs to mentions.source_name. Any comma-bearing
  // place-name record left behind after parsing is an unused source duplicate.
  const orphanedSourceNames = db.prepare(`
    SELECT names.id
    FROM place_names AS names
    WHERE instr(names.name, ',') > 0
      AND NOT EXISTS (
        SELECT 1 FROM place_name_states AS states WHERE states.place_name_id = names.id
      )
  `).all();
  for (const name of orphanedSourceNames) {
    deleteName.run(name.id);
    changed += 1;
  }

  // A source can repeat its primary name in a list of variants. Keep one
  // observed state for each name/type/mention/period combination.
  const duplicateStates = db.prepare(`
    SELECT later.id
    FROM place_name_states AS later
    JOIN place_names AS later_name ON later_name.id = later.place_name_id
    JOIN place_name_states AS earlier
      ON earlier.place_id = later.place_id
     AND earlier.source_mention_id = later.source_mention_id
     AND earlier.type_code IS later.type_code
     AND earlier.observed_year IS later.observed_year
     AND earlier.display_period IS later.display_period
     AND earlier.assertion_kind = later.assertion_kind
     AND earlier.position < later.position
    JOIN place_names AS earlier_name
      ON earlier_name.id = earlier.place_name_id
     AND lower(earlier_name.name) = lower(later_name.name)
    WHERE later.assertion_kind = 'observed'
  `).all();
  for (const state of duplicateStates) {
    deleteState.run(state.id);
    changed += 1;
  }
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}

console.log(`Нормализовано состояний имён: ${changed}. Резервная копия: ${path.relative(root, backupFile)}`);
