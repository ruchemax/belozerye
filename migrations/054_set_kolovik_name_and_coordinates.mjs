export const up = (db) => {
  const placeId = "u-pogosta-zh-na-tserkovnoy-zemle-pochinok-kolovin-1626-13";
  const editorialNameId = "editorial:kolovik";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
    throw new Error("Карточка починка Коловин не найдена.");
  }
  if (db.prepare("SELECT 1 FROM place_names WHERE place_id = ? AND name = 'Коловик'").get(placeId)) {
    throw new Error("Название Коловик уже есть в карточке.");
  }

  db.prepare(`INSERT INTO place_names (id, place_id, name, language, name_kind)
    VALUES (?, ?, 'Коловик', 'ru', 'editorial')`).run(editorialNameId, placeId);
  db.prepare(`INSERT INTO place_name_states
    (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
    VALUES ('editorial:kolovik', ?, ?, NULL, NULL, NULL, NULL, 'editorial', 1000)`)
    .run(placeId, editorialNameId);
  db.prepare("UPDATE places SET name = 'Коловик', name_origin = 'editorial' WHERE id = ?")
    .run(placeId);
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude)
    VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, 38.51989138888889, 59.24543888888889);
};
