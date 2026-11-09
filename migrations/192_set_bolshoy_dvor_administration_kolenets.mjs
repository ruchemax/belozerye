export const up = (db) => {
  const mentionId = "belozersky-1626-mention-folios-547-561-place-39";
  const kolenetsId = "subdivision:Коленца";
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ?").get(mentionId)) {
    throw new Error("The Bolshoy Dvor source mention was not found.");
  }
  if (!db.prepare("SELECT 1 FROM administrative_units WHERE id = ? AND kind = 'subdivision'").get(kolenetsId)) {
    throw new Error("The Kolenets subdivision was not found.");
  }
  db.prepare(`DELETE FROM mention_administrative_units
    WHERE mention_id = ? AND administrative_unit_id = 'volost:Чуровская' AND context_key = 'volost'`)
    .run(mentionId);
  db.prepare(`INSERT OR IGNORE INTO mention_administrative_units
    (mention_id, administrative_unit_id, context_key) VALUES (?, ?, 'subdivision')`)
    .run(mentionId, kolenetsId);
};
