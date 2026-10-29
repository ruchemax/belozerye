export const up = (db) => {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO mention_land_category_owners
      (mention_id, land_category_position, land_owner_id, position)
    VALUES (?, ?, ?, ?)
  `);
  insert.run(
    "mention-belozersky-1626-church-and-estates",
    0,
    "tserkov-bogoyavleniya-popovskaya",
    0
  );
  insert.run(
    "mention-belozersky-1626-patriarchal-churchyard-loshakovo",
    0,
    "tserkov-rozhdestva-bogoroditsy-pogost-rozhdestva-bogoroditsy-luzhkovo",
    0
  );
};
