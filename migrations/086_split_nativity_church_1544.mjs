export const up = (db) => {
  const oldChurchId = "rozhdestva-bogoroditsy-churovskaya";
  const newChurchId = "rozhdestva-bogoroditsy-churovskaya-1544";
  const sourceFragmentId = "belozersky-1544-nativity-church";
  const existingSource = db.prepare(
    "SELECT 1 FROM church_sources WHERE church_id = ? AND fragment_id = ?"
  ).get(oldChurchId, sourceFragmentId);
  if (!existingSource) throw new Error("The 1544 Nativity church source was not found on the original church.");

  db.prepare("INSERT INTO churches (id, slug, name, location_place_id) VALUES (?, ?, ?, ?)")
    .run(newChurchId, newChurchId, "Церковь Рождества Богородицы", "pogost-rozhestva-bogoroditsy");
  db.prepare("INSERT INTO church_geometries (church_id, longitude, latitude, source) VALUES (?, ?, ?, ?)")
    .run(newChurchId, 38.518646111111, 59.241895555556, "координаты церкви по пользовательскому уточнению");

  db.prepare("DELETE FROM church_sources WHERE church_id = ? AND fragment_id = ?")
    .run(oldChurchId, sourceFragmentId);
  db.prepare("INSERT INTO church_sources (church_id, fragment_id) VALUES (?, ?)")
    .run(newChurchId, sourceFragmentId);
};
