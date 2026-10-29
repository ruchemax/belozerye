export const up = (db) => {
  const updateOwner = db.prepare(`
    UPDATE mention_land_categories
    SET owner_name = ?
    WHERE mention_id = ? AND code = 'patriarchal'
  `);
  updateOwner.run("Михаил Чюровский", "mention-belozersky-1626-igumnova");
  updateOwner.run("Грязной и Григорий Чюровские", "mention-belozersky-1626-igumnova-second");
};
