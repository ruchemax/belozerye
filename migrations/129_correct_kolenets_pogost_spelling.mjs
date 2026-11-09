export const up = (db) => {
  const oldName = db.prepare("SELECT id FROM place_names WHERE place_id = 'pishchalinskoe' AND name = 'Коленецкий погость'").get();
  const correctName = db.prepare("SELECT id FROM place_names WHERE place_id = 'pishchalinskoe' AND name = 'Коленецкий погост'").get();
  if (oldName && correctName) {
    db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE place_name_id = ?").run(correctName.id, oldName.id);
    db.prepare("DELETE FROM place_names WHERE id = ?").run(oldName.id);
  } else if (oldName) {
    db.prepare("UPDATE place_names SET name = 'Коленецкий погост' WHERE id = ?").run(oldName.id);
  }
  db.prepare("UPDATE mentions SET historical_name_override = 'Коленецкий погост' WHERE place_id = 'pishchalinskoe' AND historical_name_override = 'Коленецкий погость'").run();
};
