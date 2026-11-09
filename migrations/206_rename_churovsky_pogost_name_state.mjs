export const up = (db) => {
  const nameId = "attested:pogost-rozhestva-bogoroditsy:51";
  const row = db.prepare("SELECT name FROM place_names WHERE id = ?").get(nameId);
  if (row?.name !== "Рождества Богородицы") {
    throw new Error("The Nativity churchyard name state was not found in its expected form.");
  }
  db.prepare("UPDATE place_names SET name = ? WHERE id = ?").run("Чуровский", nameId);
};
