export const up = (db) => {
  const unitIds = ["subdivision:Чаромский ключ", "subdivision:село Ильинское"];
  for (const id of unitIds) {
    if (!db.prepare("SELECT 1 FROM administrative_units WHERE id = ?").get(id)) {
      throw new Error(`The administrative unit ${id} was not found.`);
    }
  }
  const findMention = db.prepare(`
    SELECT mentions.id FROM mentions
    JOIN fragments ON fragments.id = mentions.fragment_id
    WHERE fragments.book_id = 'belozersky-1626' AND fragments.source_heading_id = ?
  `);
  const insert = db.prepare(`
    INSERT OR IGNORE INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
    VALUES (?, ?, 'subdivision')
  `);
  for (let number = 57; number <= 106; number++) {
    const headingId = `folios-547-561-place-${number}-heading`;
    const mention = findMention.get(headingId);
    if (!mention) throw new Error(`The Ilyinskoe wasteland mention ${headingId} was not found.`);
    for (const unitId of unitIds) insert.run(mention.id, unitId);
  }
};
