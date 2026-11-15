export const up = (db) => {
  const unitId = "subdivision:Чюравских";
  const unit = db.prepare("SELECT name FROM administrative_units WHERE id = ?").get(unitId);
  if (unit?.name !== "Чуровские") throw new Error("The Churovskie administrative unit was not found.");
  db.prepare("UPDATE administrative_units SET name = ? WHERE id = ?")
    .run("Чюравские", unitId);
};
