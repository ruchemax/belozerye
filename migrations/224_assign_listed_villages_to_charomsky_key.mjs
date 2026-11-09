export const up = (db) => {
  const keyId = "subdivision:Чаромский ключ";
  if (!db.prepare("SELECT 1 FROM administrative_units WHERE id = ?").get(keyId)) {
    throw new Error("The Charomsky key administrative unit was not found.");
  }
  const findMention = db.prepare(`
    SELECT mentions.id FROM mentions
    JOIN fragments ON fragments.id = mentions.fragment_id
    WHERE fragments.book_id = 'belozersky-1626' AND fragments.source_heading_id = ?
  `);
  const remove = db.prepare(`
    DELETE FROM mention_administrative_units
    WHERE mention_id = ? AND context_key = 'subdivision' AND administrative_unit_id <> ?
  `);
  const insert = db.prepare(`
    INSERT OR IGNORE INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
    VALUES (?, ?, 'subdivision')
  `);
  for (let number = 20; number <= 28; number++) {
    const headingId = `folios-547-561-place-${number}-heading`;
    const mention = findMention.get(headingId);
    if (!mention) throw new Error(`The Charomsky key mention ${headingId} was not found.`);
    remove.run(mention.id, keyId);
    insert.run(mention.id, keyId);
  }
};
