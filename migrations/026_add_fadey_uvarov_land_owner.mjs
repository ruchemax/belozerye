export const up = (db) => {
  const ownerId = "fadey-grigoryev-syn-uvarov";
  const mentionIds = [
    "mention-belozersky-1626-krushkova",
    "mention-belozersky-1626-land-record-5",
    "mention-belozersky-1626-land-record-6",
    "mention-belozersky-1626-land-record-7",
    "mention-belozersky-1626-koshcheev",
    "mention-belozersky-1626-malgina"
  ];

  db.prepare("INSERT OR IGNORE INTO land_owners (id, name) VALUES (?, ?)")
    .run(ownerId, "Фадей Григорьев сын Уваров");

  const category = db.prepare(`
    SELECT position
    FROM mention_land_categories
    WHERE mention_id = ? AND code = 'landowner'
  `);
  const addOwner = db.prepare(`
    INSERT OR IGNORE INTO mention_land_category_owners
      (mention_id, land_category_position, land_owner_id, position)
    VALUES (?, ?, ?, 0)
  `);

  for (const mentionId of mentionIds) {
    const row = category.get(mentionId);
    if (!row) throw new Error(`Landowner category was not found for ${mentionId}.`);
    addOwner.run(mentionId, row.position, ownerId);
  }
};
