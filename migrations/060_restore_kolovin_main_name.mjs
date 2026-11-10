export const up = (db) => {
  const placeId = "u-pogosta-zh-na-tserkovnoy-zemle-pochinok-kolovin-1626-13";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ? AND name = 'Коловик'").get(placeId)) {
    throw new Error("Ожидаемое основное название Коловика не найдено.");
  }
  db.prepare("DELETE FROM place_name_states WHERE id = 'editorial:kolovik' AND place_id = ?").run(placeId);
  db.prepare("DELETE FROM place_names WHERE id = 'editorial:kolovik' AND place_id = ?").run(placeId);
  db.prepare("UPDATE places SET name = 'Коловин', name_origin = 'observed' WHERE id = ?")
    .run(placeId);
};
