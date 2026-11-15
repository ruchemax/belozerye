const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const corrections = (source) => [...source.matchAll(/([\p{L}-]+)\s+\[([\p{L}\s-]+)\]/gu)]
  .map((match) => [match[1], match[2].trim()]);
const correct = (name, replacements) => replacements.reduce((result, [original, corrected]) =>
  result.replace(new RegExp(`(?<![\\p{L}])${escapeRegex(original)}(?![\\p{L}])`, "gu"), corrected), name);
const correctSource = (source) => source.replace(/([\p{L}-]+)\s+\[([\p{L}\s-]+)\]/gu, (_match, _original, corrected) => corrected.trim());

export const up = (db) => {
  const mentions = db.prepare("SELECT id, place_id, source_name, historical_name_override FROM mentions WHERE instr(source_name, '[') > 0").all();
  let changed = 0;
  for (const mention of mentions) {
    const replacements = corrections(mention.source_name);
    if (!replacements.length) continue;
    const states = db.prepare(`SELECT s.*, n.name FROM place_name_states s
      JOIN place_names n ON n.id = s.place_name_id WHERE s.source_mention_id = ?`).all(mention.id);
    for (const state of states) {
      const name = correct(state.name, replacements);
      if (name === state.name) continue;
      let nameId = db.prepare("SELECT id FROM place_names WHERE place_id = ? AND name = ?").get(state.place_id, name)?.id;
      if (!nameId) {
        nameId = `corrected:${state.id}`;
        db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, ?, 'ru', 'attested')")
          .run(nameId, state.place_id, name);
      }
      const duplicate = db.prepare(`SELECT id FROM place_name_states WHERE source_mention_id = ?
        AND place_name_id = ? AND type_code IS ? AND observed_year IS ? AND display_period IS ?
        AND assertion_kind = ? AND id <> ?`).get(mention.id, nameId, state.type_code,
        state.observed_year, state.display_period, state.assertion_kind, state.id);
      if (duplicate) db.prepare("DELETE FROM place_name_states WHERE id = ?").run(state.id);
      else db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE id = ?").run(nameId, state.id);
      changed++;
    }
    const override = mention.historical_name_override ?? mention.source_name;
    db.prepare("UPDATE mentions SET historical_name_override = ? WHERE id = ?").run(correctSource(override), mention.id);
    const place = db.prepare("SELECT name FROM places WHERE id = ?").get(mention.place_id);
    const name = correct(place.name, replacements);
    if (name !== place.name) db.prepare("UPDATE places SET name = ? WHERE id = ?").run(name, mention.place_id);
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after correcting historical names.");
  console.log(`Corrected historical name states: ${changed}.`);
};
