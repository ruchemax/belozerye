export const up = (db) => {
  db.exec("ALTER TABLE mention_administrative_units ADD COLUMN display_label TEXT");
  const update = db.prepare(`
    UPDATE mention_administrative_units SET display_label = 'тянут к Запогостью'
    WHERE mention_id = ? AND administrative_unit_id = 'subdivision:Запогостье'
      AND context_key = 'subdivision'
  `);
  for (const number of [16, 17]) {
    const mentionId = `belozersky-1626-mention-folios-547-561-place-${number}`;
    if (update.run(mentionId).changes !== 1) {
      throw new Error(`The Zapogost affiliation for ${mentionId} was not found.`);
    }
  }
};
