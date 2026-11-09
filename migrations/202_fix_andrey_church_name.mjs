export const up = (db) => {
  const churchId = "andreya-pervozvannogo-charoma";
  const result = db.prepare("UPDATE churches SET name = ? WHERE id = ?")
    .run("Церковь Андрея Первозванного", churchId);
  if (result.changes !== 1) throw new Error("The Andrew church card was not found.");
};
