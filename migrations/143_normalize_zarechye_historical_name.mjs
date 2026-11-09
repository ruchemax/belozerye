export const up = (db) => {
  const placeId = "larino";
  const oldName = db.prepare("SELECT id FROM place_names WHERE place_id = ? AND name = 'Заречьем'").get(placeId);
  if (!oldName) throw new Error("The historical Zarechyem name was not found.");
  const correctName = db.prepare("SELECT id FROM place_names WHERE place_id = ? AND name = 'Заречье'").get(placeId);
  if (correctName) {
    db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE place_name_id = ?").run(correctName.id, oldName.id);
    db.prepare("DELETE FROM place_names WHERE id = ?").run(oldName.id);
  } else {
    db.prepare("UPDATE place_names SET name = 'Заречье' WHERE id = ?").run(oldName.id);
  }
};
