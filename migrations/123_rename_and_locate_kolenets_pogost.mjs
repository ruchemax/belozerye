export const up = (db) => {
  const placeId = "v-kolentse-na-reke-na-sheksne-pogost-1626-18";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) throw new Error("The Kolenets pogost card was not found.");
  db.prepare("UPDATE places SET name = 'Коленецкий погост', name_origin = 'editorial' WHERE id = ?").run(placeId);
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, 38.48525, 59.46775)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`).run(placeId);
  const nameId = "editorial:kolenets-pogost:display-name";
  db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, 'Коленецкий погост', 'ru', 'editorial')")
    .run(nameId, placeId);
  const position = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM place_name_states WHERE place_id = ?").get(placeId).value;
  db.prepare(`INSERT INTO place_name_states
    (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
    VALUES ('editorial:kolenets-pogost:display-name', ?, ?, NULL, NULL, NULL, NULL, 'editorial', ?)`)
    .run(placeId, nameId, position);
};
