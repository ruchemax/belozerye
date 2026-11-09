export const up = (db) => {
  const unitId = "subdivision:Запогостье";
  db.prepare(`
    INSERT INTO administrative_units (id, kind, name, label)
    VALUES (?, 'subdivision', 'Запогостье', NULL)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name
  `).run(unitId);
  const findMention = db.prepare(`
    SELECT mentions.id FROM mentions JOIN fragments ON fragments.id = mentions.fragment_id
    WHERE fragments.book_id = 'belozersky-1626' AND fragments.source_heading_id = ?
  `);
  const setSubdivision = db.prepare(`
    INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
    VALUES (?, ?, 'subdivision')
    ON CONFLICT(mention_id, context_key) DO UPDATE
      SET administrative_unit_id = excluded.administrative_unit_id
  `);
  for (let number = 11; number <= 17; number++) {
    const headingId = `folios-547-561-place-${number}-heading`;
    const mention = findMention.get(headingId);
    if (!mention) throw new Error(`The source mention for ${headingId} was not found.`);
    setSubdivision.run(mention.id, unitId);
  }
};
