export const up = (db) => {
  db.prepare(`
    INSERT OR IGNORE INTO mention_land_category_owners
      (mention_id, land_category_position, land_owner_id, position)
    VALUES (?, ?, ?, ?)
  `).run(
    "mention-belozersky-1626-popovskaya-001",
    0,
    "tserkov-bogoyavleniya-popovskaya",
    0
  );
};
