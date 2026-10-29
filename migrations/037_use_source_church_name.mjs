export const up = (db) => {
  db.prepare("UPDATE churches SET name = ? WHERE id = ?")
    .run("Пречистые Богородицы и Чеснаго Рожества", "nativity-bogoroditsy-churovskaya");
};
