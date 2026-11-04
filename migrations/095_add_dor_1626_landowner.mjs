export const up = (db) => {
  const mentionId = "mention-belozersky-1626-land-record-12";
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = 'dor'").get(mentionId)) {
    throw new Error("The 1626/27 Dor mention was not found.");
  }

  db.prepare("INSERT OR IGNORE INTO land_owners (id, name) VALUES (?, ?)")
    .run("ivan-varsobin", "Иван Варсобин");
  const owner = db.prepare("SELECT id FROM land_owners WHERE name = ?").get("Иван Варсобин");
  const existingCategory = db.prepare("SELECT position FROM mention_land_categories WHERE mention_id = ? AND code = 'landowner'").get(mentionId);
  const position = existingCategory?.position ?? db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM mention_land_categories WHERE mention_id = ?").get(mentionId).value;
  if (!existingCategory) {
    db.prepare("INSERT INTO mention_land_categories (mention_id, position, code, label) VALUES (?, ?, 'landowner', ?)")
      .run(mentionId, position, "Помещичья");
  }
  db.prepare("INSERT OR IGNORE INTO mention_land_category_owners (mention_id, land_category_position, land_owner_id, position) VALUES (?, ?, ?, 0)")
    .run(mentionId, position, owner.id);
};
