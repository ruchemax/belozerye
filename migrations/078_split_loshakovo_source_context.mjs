export const up = (db) => {
  const original = "mention-belozersky-1544-place-12-1-metropolitan";
  const monastery = "mention-belozersky-1544-place-12-1-monastery";

  db.prepare(`
    INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
    SELECT ?, administrative_unit_id, context_key
    FROM mention_administrative_units WHERE mention_id = ?
  `).run(monastery, original);

  db.prepare(`
    INSERT INTO mention_land_categories (mention_id, position, code, label, display_period)
    SELECT ?, 0, code, label, display_period
    FROM mention_land_categories WHERE mention_id = ? AND code = 'monastery'
  `).run(monastery, original);
  db.prepare(`
    INSERT INTO mention_land_category_owners (mention_id, land_category_position, land_owner_id, position)
    SELECT ?, 0, land_owner_id, position
    FROM mention_land_category_owners WHERE mention_id = ? AND land_category_position = 0
  `).run(monastery, original);

  db.prepare("DELETE FROM mention_land_category_owners WHERE mention_id = ? AND land_category_position = 0")
    .run(original);
  db.prepare("DELETE FROM mention_land_categories WHERE mention_id = ? AND code = 'monastery'")
    .run(original);
  db.prepare("UPDATE mention_land_categories SET position = 0 WHERE mention_id = ? AND code = 'metropolitan'")
    .run(original);
};
