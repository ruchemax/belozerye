export const up = (db) => {
  const nameId = "attested:popovskaya:10";
  const row = db.prepare("SELECT name FROM place_names WHERE id = ?").get(nameId);
  if (row?.name !== "Богоявления") throw new Error("The Epiphany churchyard name was not found in its expected form.");
  db.prepare("UPDATE place_names SET name = ? WHERE id = ?")
    .run("Богоявленский", nameId);
};
