export const up = (db) => {
  const mentionIds = [
    "belozersky-1626-mention-folios-547-561-place-45",
    "belozersky-1626-mention-folios-547-561-place-44"
  ];
  const sudbitsyId = "subdivision:Судбицах";
  if (!db.prepare("SELECT 1 FROM administrative_units WHERE id = ? AND kind = 'subdivision'").get(sudbitsyId)) {
    throw new Error("The Sudbitsy administrative subdivision was not found.");
  }
  const replace = db.prepare(`DELETE FROM mention_administrative_units
    WHERE mention_id = ? AND administrative_unit_id = 'volost:Чуровская' AND context_key = 'volost'`);
  const add = db.prepare(`INSERT OR IGNORE INTO mention_administrative_units
    (mention_id, administrative_unit_id, context_key) VALUES (?, ?, 'subdivision')`);
  for (const mentionId of mentionIds) {
    if (!db.prepare("SELECT 1 FROM mentions WHERE id = ?").get(mentionId)) {
      throw new Error(`The administrative source mention ${mentionId} was not found.`);
    }
    replace.run(mentionId);
    add.run(mentionId, sudbitsyId);
  }
};
