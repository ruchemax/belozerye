export const up = (db) => {
  const keyId = "subdivision:Чаромский ключ";
  const seloId = "subdivision:село Ильинское";
  if (!db.prepare("SELECT 1 FROM administrative_units WHERE id = ? AND kind = 'subdivision'").get(keyId)) {
    throw new Error("The Charomsky key administrative unit was not found.");
  }
  db.prepare(`
    INSERT INTO administrative_units (id, kind, name, label)
    VALUES (?, 'subdivision', 'село Ильинское', NULL)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name
  `).run(seloId);

  const findMention = db.prepare(`
    SELECT mentions.id FROM mentions
    JOIN fragments ON fragments.id = mentions.fragment_id
    WHERE fragments.book_id = 'belozersky-1626' AND fragments.source_heading_id = ?
  `);
  const insert = db.prepare(`
    INSERT OR IGNORE INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
    VALUES (?, ?, 'subdivision')
  `);
  for (let number = 2; number <= 10; number++) {
    const headingId = `folios-547-561-place-${number}-heading`;
    const mention = findMention.get(headingId);
    if (!mention) throw new Error(`The Ilyinskoe village mention ${headingId} was not found.`);
    insert.run(mention.id, keyId);
    insert.run(mention.id, seloId);
  }
};
