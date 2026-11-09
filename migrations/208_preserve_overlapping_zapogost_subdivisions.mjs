export const up = (db) => {
  const overlaps = [
    ["belozersky-1626-mention-folios-547-561-place-39", "subdivision:Коленца"],
    ["belozersky-1626-mention-folios-547-561-place-41", "subdivision:Коленца"],
    ["belozersky-1626-mention-folios-547-561-place-44", "subdivision:Судбицах"],
    ["belozersky-1626-mention-folios-547-561-place-45", "subdivision:Судбицах"]
  ];
  const insert = db.prepare(`
    INSERT OR IGNORE INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
    VALUES (?, ?, 'subdivision')
  `);
  for (const [mentionId, subdivisionId] of overlaps) {
    if (!db.prepare("SELECT 1 FROM mentions WHERE id = ?").get(mentionId)) {
      throw new Error(`The mention ${mentionId} was not found.`);
    }
    if (!db.prepare("SELECT 1 FROM administrative_units WHERE id = ? AND kind = 'subdivision'").get(subdivisionId)) {
      throw new Error(`The subdivision ${subdivisionId} was not found.`);
    }
    insert.run(mentionId, subdivisionId);
  }
};
