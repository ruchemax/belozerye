export const up = (db) => {
  db.exec(`
    ALTER TABLE land_owners
      ADD COLUMN location_place_id TEXT REFERENCES places(id) ON UPDATE CASCADE ON DELETE SET NULL;
  `);
  const update = db.prepare("UPDATE land_owners SET name = ?, location_place_id = ? WHERE id = ?");
  update.run("Церковь Богоявления", "popovskaya", "tserkov-bogoyavleniya-popovskaya");
  update.run(
    "Церковь Рождества Богородицы",
    "pogost-rozhestva-bogoroditsy",
    "tserkov-rozhdestva-bogoroditsy-pogost-rozhdestva-bogoroditsy-luzhkovo"
  );
};
