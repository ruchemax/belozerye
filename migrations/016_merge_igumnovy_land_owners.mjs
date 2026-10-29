export const up = (db) => {
  db.prepare(`
    UPDATE mention_land_categories
    SET owner_name = ?
    WHERE mention_id IN (?, ?) AND code = 'patriarchal'
  `).run(
    "Михаил, Грязной и Григорий Чюровские",
    "mention-belozersky-1626-igumnova",
    "mention-belozersky-1626-igumnova-second"
  );
};
