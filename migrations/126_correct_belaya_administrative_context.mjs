export const up = (db) => {
  const mentionId = "belozersky-1626-mention-folios-547-561-place-19";
  const unitId = "subdivision:Коленца";
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ?").get(mentionId)) throw new Error("The Belaya source mention was not found.");
  if (!db.prepare("SELECT 1 FROM administrative_units WHERE id = ?").get(unitId)) throw new Error("The Kolenets administrative unit was not found.");
  db.prepare("DELETE FROM mention_administrative_units WHERE mention_id = ? AND context_key = 'volost'").run(mentionId);
  db.prepare(`INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
    VALUES (?, ?, 'subdivision')
    ON CONFLICT(mention_id, context_key) DO UPDATE SET administrative_unit_id = excluded.administrative_unit_id`)
    .run(mentionId, unitId);
};
