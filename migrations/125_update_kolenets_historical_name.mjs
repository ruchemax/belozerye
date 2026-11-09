export const up = (db) => {
  const mentionId = "belozersky-1626-mention-folios-547-561-place-18";
  const state = db.prepare("SELECT id, place_name_id FROM place_name_states WHERE source_mention_id = ? AND assertion_kind = 'observed'").get(mentionId);
  if (!state) throw new Error("The Kolenets pogost historical name was not found.");
  db.prepare("UPDATE place_names SET name = 'Коленецкий погость' WHERE id = ?").run(state.place_name_id);
  db.prepare("UPDATE place_name_states SET type_code = NULL WHERE id = ?").run(state.id);
  db.prepare("UPDATE mentions SET historical_name_override = 'Коленецкий погость' WHERE id = ?").run(mentionId);
};
