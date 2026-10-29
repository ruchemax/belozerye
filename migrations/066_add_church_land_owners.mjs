export const up = (db) => {
  const insert = db.prepare("INSERT OR IGNORE INTO land_owners (id, name) VALUES (?, ?)");
  insert.run("tserkov-bogoyavleniya-popovskaya", "Церковь Богоявления (Поповская)");
  insert.run(
    "tserkov-rozhdestva-bogoroditsy-pogost-rozhdestva-bogoroditsy-luzhkovo",
    "Церковь Рождества Богородицы (погост Рождества Богородицы, Лужково)"
  );
};
