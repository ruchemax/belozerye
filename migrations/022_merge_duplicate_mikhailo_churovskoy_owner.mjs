export const up = (db) => {
  db.prepare(`
    DELETE FROM mention_land_category_owners
    WHERE mention_id = ? AND land_category_position = ? AND land_owner_id = ?
  `).run("mention-belozersky-1626-land-record-50", 0, "mikhailo-churovskoy");
  db.prepare(`
    INSERT OR IGNORE INTO mention_land_category_owners
      (mention_id, land_category_position, land_owner_id, position)
    VALUES (?, ?, ?, ?)
  `).run("mention-belozersky-1626-land-record-50", 0, "mikhailo-nepostavov-churovsky", 0);
  db.prepare("DELETE FROM land_owners WHERE id = ?")
    .run("mikhailo-churovskoy");
};
