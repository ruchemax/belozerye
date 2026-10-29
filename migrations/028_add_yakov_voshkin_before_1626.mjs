export const up = (db) => {
  const mentionId = "mention-belozersky-1626-land-record-11";
  const ownerId = "yakov-voshkin";
  const columns = new Set(db.prepare("PRAGMA table_info(mention_land_categories)").all()
    .map((column) => column.name));
  if (!columns.has("display_period")) {
    db.exec("ALTER TABLE mention_land_categories ADD COLUMN display_period TEXT");
  }

  db.prepare("INSERT OR IGNORE INTO land_owners (id, name) VALUES (?, ?)")
    .run(ownerId, "Яков Вошкин");
  db.prepare(`
    INSERT OR IGNORE INTO mention_land_categories
      (mention_id, position, code, label, display_period)
    VALUES (?, ?, ?, ?, ?)
  `).run(mentionId, 1, "landowner", "Помещичья", "до 1626/27");
  db.prepare(`
    INSERT OR IGNORE INTO mention_land_category_owners
      (mention_id, land_category_position, land_owner_id, position)
    VALUES (?, ?, ?, ?)
  `).run(mentionId, 1, ownerId, 0);
};
