export const up = (db) => {
  const targetId = "pochinok-ugla";
  const oldId = "derevnya-pachinok-pochinok-1626-54";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-54";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(targetId)) {
    throw new Error("The Pochinok Uglа card was not found.");
  }
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(oldId)) {
    throw new Error("The Pachinok source card was not found.");
  }
  const mention = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(mentionId);
  if (mention?.place_id !== oldId) throw new Error("The Pachinok source record is not linked to its expected card.");

  const offset = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM place_name_states WHERE place_id = ?")
    .get(targetId).value;
  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE id = ?").run(targetId, mentionId);
  db.prepare("UPDATE place_names SET place_id = ? WHERE id IN (SELECT place_name_id FROM place_name_states WHERE source_mention_id = ?)")
    .run(targetId, mentionId);
  db.prepare("UPDATE place_name_states SET place_id = ?, position = position + ? WHERE source_mention_id = ?")
    .run(targetId, offset, mentionId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after linking the Pachinok source record.");
};
