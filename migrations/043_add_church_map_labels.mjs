export const up = (db) => {
  const columns = new Set(db.prepare("PRAGMA table_info(churches)").all().map((column) => column.name));
  if (!columns.has("map_label")) db.exec("ALTER TABLE churches ADD COLUMN map_label TEXT");

  const update = db.prepare("UPDATE churches SET map_label = ? WHERE id = ?");
  update.run("Церковь Богоявления", "bogoyavlenie-ugol");
  update.run("Церковь Богоявления", "bogoyavlenie-state-churchyard");
  update.run("Церковь Рождества Богородицы", "nativity-bogoroditsy-churovskaya");
  update.run("Церковь Николая Чудотворца", "nicholas-chudotvorets-churovskaya");
};
