export const up = (db) => {
  const unitId = "subdivision:Чаромский ключ";
  db.prepare(`
    INSERT INTO administrative_units (id, kind, name, label)
    VALUES (?, 'subdivision', 'Чаромский ключ', NULL)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name
  `).run(unitId);

  const findMention = db.prepare(`
    SELECT mentions.id
    FROM mentions JOIN fragments ON fragments.id = mentions.fragment_id
    WHERE fragments.book_id = 'belozersky-1626' AND fragments.source_heading_id = ?
  `);
  const setSubdivision = db.prepare(`
    INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
    VALUES (?, ?, 'subdivision')
    ON CONFLICT(mention_id, context_key) DO UPDATE
      SET administrative_unit_id = excluded.administrative_unit_id
  `);
  // The first group and the group after the third section heading explicitly belong to this key.
  for (const [start, end] of [[1, 10], [20, 35]]) {
    for (let number = start; number <= end; number++) {
      const heading = `folios-547-561-place-${number}-heading`;
      const mention = findMention.get(heading);
      if (!mention) throw new Error(`The source mention for ${heading} was not found.`);
      setSubdivision.run(mention.id, unitId);
    }
  }
};
