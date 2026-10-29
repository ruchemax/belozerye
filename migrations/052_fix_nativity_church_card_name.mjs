export const up = (db) => {
  db.prepare("UPDATE churches SET name = ? WHERE id = ?")
    .run("Рождества Богородицы", "nativity-bogoroditsy-churovskaya");
};
