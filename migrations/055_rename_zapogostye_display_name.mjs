export const up = (db) => {
  const placeId = "zapogostye";
  const editorialNameId = "editorial:zapogostye:display-name";
  const current = db.prepare("SELECT name FROM places WHERE id = ?").get(placeId)?.name;
  if (current !== "Запогостский погост") {
    throw new Error("Ожидаемое основное название Запогостского погоста не найдено.");
  }
  db.prepare("UPDATE place_names SET name = 'Погост Запогостье' WHERE id = ? AND place_id = ?")
    .run(editorialNameId, placeId);
  db.prepare("UPDATE places SET name = 'Погост Запогостье', name_origin = 'editorial' WHERE id = ?")
    .run(placeId);
};
