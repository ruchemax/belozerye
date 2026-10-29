const placeId = "aristov";

export const up = (db) => {
  db.prepare("UPDATE places SET type_code = 'pochinok' WHERE id = ?").run(placeId);
  db.prepare("UPDATE place_name_states SET type_code = 'pochinok' WHERE place_id = ?").run(placeId);

  const place = db.prepare("SELECT type_code FROM places WHERE id = ?").get(placeId);
  if (!place || place.type_code !== "pochinok") {
    throw new Error("Не удалось установить тип «Починок» для Аристова.");
  }
};
