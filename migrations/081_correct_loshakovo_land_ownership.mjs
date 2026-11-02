export const up = (db) => {
  const monasteryMention = "mention-belozersky-1544-place-12-1-metropolitan";
  const metropolitanMention = "mention-belozersky-1544-place-12-1-monastery";

  // The original mention ID carries the 1544 observed name state and is now
  // attached to the monastery settlement. Put the corresponding ownership
  // on that mention and the metropolitan category on the second mention.
  db.prepare("DELETE FROM mention_land_category_owners WHERE mention_id IN (?, ?)")
    .run(monasteryMention, metropolitanMention);
  db.prepare("DELETE FROM mention_land_categories WHERE mention_id IN (?, ?)")
    .run(monasteryMention, metropolitanMention);

  const addCategory = db.prepare(`
    INSERT INTO mention_land_categories (mention_id, position, code, label, display_period)
    VALUES (?, 0, ?, ?, '1544')
  `);
  addCategory.run(monasteryMention, "monastery", "Монастырская");
  addCategory.run(metropolitanMention, "metropolitan", "Митрополичья");

  db.prepare(`
    INSERT INTO mention_land_category_owners (mention_id, land_category_position, land_owner_id, position)
    VALUES (?, 0, 'kirillo-belozersky-monastery', 0)
  `).run(monasteryMention);
};
