export const up = (db) => {
  db.prepare("INSERT OR IGNORE INTO land_owners (id, name) VALUES (?, ?)")
    .run("mikhailo-churovskoy", "Михайло Чюровской");
  db.prepare(`
    INSERT OR IGNORE INTO mention_land_category_owners
      (mention_id, land_category_position, land_owner_id, position)
    VALUES (?, ?, ?, ?)
  `).run("mention-belozersky-1626-land-record-50", 0, "mikhailo-churovskoy", 0);
};
