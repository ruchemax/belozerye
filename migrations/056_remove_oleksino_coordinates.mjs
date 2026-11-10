export const up = (db) => {
  const placeId = "oleksino";
  const place = db.prepare("SELECT id FROM places WHERE id = ?").get(placeId);
  if (!place) throw new Error("Карточка деревни Олексино не найдена.");
  db.prepare("DELETE FROM place_geometries WHERE place_id = ?").run(placeId);
};
