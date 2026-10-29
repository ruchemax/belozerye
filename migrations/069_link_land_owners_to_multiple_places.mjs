export const up = (db) => {
  db.exec(`
    ALTER TABLE land_owners DROP COLUMN location_place_id;
    CREATE TABLE land_owner_places (
      land_owner_id TEXT NOT NULL REFERENCES land_owners(id) ON UPDATE CASCADE ON DELETE CASCADE,
      place_id TEXT NOT NULL REFERENCES places(id) ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY (land_owner_id, place_id)
    );
  `);
  const linkPlace = db.prepare("INSERT INTO land_owner_places (land_owner_id, place_id) VALUES (?, ?)");
  linkPlace.run("tserkov-bogoyavleniya-popovskaya", "popovskaya");
  linkPlace.run("tserkov-rozhdestva-bogoroditsy-pogost-rozhdestva-bogoroditsy-luzhkovo", "pogost-rozhestva-bogoroditsy");
  linkPlace.run("tserkov-rozhdestva-bogoroditsy-pogost-rozhdestva-bogoroditsy-luzhkovo", "luzhkovo");
  db.prepare(`
    INSERT OR IGNORE INTO mention_land_category_owners
      (mention_id, land_category_position, land_owner_id, position)
    VALUES (?, ?, ?, ?)
  `).run(
    "mention-belozersky-1626-church-lands-luzhkovo",
    0,
    "tserkov-rozhdestva-bogoroditsy-pogost-rozhdestva-bogoroditsy-luzhkovo",
    0
  );
};
