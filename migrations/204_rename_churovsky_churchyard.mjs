export const up = (db) => {
  const result = db.prepare("UPDATE places SET name = ? WHERE id = ? AND name = ?")
    .run("Чуровский погост", "pogost-rozhestva-bogoroditsy", "Погост Рождества Богородицы");
  if (result.changes !== 1) throw new Error("The Nativity churchyard place was not found in its expected form.");
};
