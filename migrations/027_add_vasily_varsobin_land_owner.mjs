export const up = (db) => {
  const mentionId = "mention-belozersky-1626-malgina";
  const ownerId = "vasily-varsobin";
  const category = db.prepare(`
    SELECT position
    FROM mention_land_categories
    WHERE mention_id = ? AND code = 'landowner'
  `).get(mentionId);
  if (!category) throw new Error(`Landowner category was not found for ${mentionId}.`);

  db.prepare("INSERT OR IGNORE INTO land_owners (id, name) VALUES (?, ?)")
    .run(ownerId, "Василий Варсобин");
  db.prepare(`
    INSERT OR IGNORE INTO mention_land_category_owners
      (mention_id, land_category_position, land_owner_id, position)
    VALUES (?, ?, ?, ?)
  `).run(mentionId, category.position, ownerId, 1);
};
