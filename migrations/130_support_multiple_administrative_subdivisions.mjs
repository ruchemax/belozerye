export const up = (db) => {
  db.exec(`
    CREATE TABLE mention_administrative_units_multi (
      mention_id TEXT NOT NULL REFERENCES mentions(id) ON DELETE CASCADE,
      administrative_unit_id TEXT NOT NULL REFERENCES administrative_units(id),
      context_key TEXT NOT NULL,
      PRIMARY KEY (mention_id, context_key, administrative_unit_id)
    );
    INSERT INTO mention_administrative_units_multi (mention_id, administrative_unit_id, context_key)
      SELECT mention_id, administrative_unit_id, context_key
      FROM mention_administrative_units ORDER BY rowid;
    DROP TABLE mention_administrative_units;
    ALTER TABLE mention_administrative_units_multi RENAME TO mention_administrative_units;
    CREATE UNIQUE INDEX mention_administrative_single_context
      ON mention_administrative_units (mention_id, context_key)
      WHERE context_key <> 'subdivision';
  `);
  const findMention = db.prepare(`
    SELECT mentions.id FROM mentions JOIN fragments ON fragments.id = mentions.fragment_id
    WHERE fragments.book_id = 'belozersky-1626' AND fragments.source_heading_id = ?
  `);
  const addUnit = db.prepare(`INSERT OR IGNORE INTO mention_administrative_units
    (mention_id, administrative_unit_id, context_key) VALUES (?, ?, 'subdivision')`);
  for (let number = 20; number <= 35; number++) {
    const headingId = `folios-547-561-place-${number}-heading`;
    const mention = findMention.get(headingId);
    if (!mention) throw new Error(`The source mention for ${headingId} was not found.`);
    for (const unitId of ['subdivision:Чаромский ключ', 'subdivision:Запогостье']) {
      addUnit.run(mention.id, unitId);
    }
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid administrative subdivision references.");
};
