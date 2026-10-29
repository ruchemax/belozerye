export const up = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS land_owners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS mention_land_category_owners (
      mention_id TEXT NOT NULL,
      land_category_position INTEGER NOT NULL,
      land_owner_id TEXT NOT NULL REFERENCES land_owners(id),
      position INTEGER NOT NULL,
      PRIMARY KEY (mention_id, land_category_position, land_owner_id),
      FOREIGN KEY (mention_id, land_category_position)
        REFERENCES mention_land_categories(mention_id, position)
        ON DELETE CASCADE
    );
  `);

  const addOwner = db.prepare("INSERT OR IGNORE INTO land_owners (id, name) VALUES (?, ?)");
  addOwner.run("kirillo-belozersky-monastery", "Кирилло-Белозерский монастырь");
  addOwner.run("mikhailo-nepostavov-churovsky", "Михайло Непоставов Чюровский");
  addOwner.run("gryaznoy-i-grigoriy-churovskie", "Грязной и Григорий Чюровские");

  const addRelation = db.prepare(`
    INSERT OR IGNORE INTO mention_land_category_owners
      (mention_id, land_category_position, land_owner_id, position)
    VALUES (?, ?, ?, ?)
  `);
  for (const row of db.prepare("SELECT mention_id, position FROM mention_land_categories WHERE code = 'monastery'").all()) {
    addRelation.run(row.mention_id, row.position, "kirillo-belozersky-monastery", 0);
  }
  for (const mentionId of ["mention-belozersky-1626-igumnova", "mention-belozersky-1626-igumnova-second"]) {
    addRelation.run(mentionId, 0, "mikhailo-nepostavov-churovsky", 0);
    addRelation.run(mentionId, 0, "gryaznoy-i-grigoriy-churovskie", 1);
  }

  const columns = new Set(db.prepare("PRAGMA table_info(mention_land_categories)").all().map((column) => column.name));
  if (columns.has("owner_name")) db.exec("ALTER TABLE mention_land_categories DROP COLUMN owner_name");
};
