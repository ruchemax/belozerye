export const up = (db) => {
  const placeId = "zapogostye";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) throw new Error("The Zapogostye pogost card was not found.");
  db.prepare("UPDATE places SET name = 'Запогостский погост', name_origin = 'editorial' WHERE id = ?").run(placeId);
  const nameId = "editorial:zapogostye:display-name";
  db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, 'Запогостский погост', 'ru', 'editorial')")
    .run(nameId, placeId);
  const position = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM place_name_states WHERE place_id = ?").get(placeId).value;
  db.prepare(`INSERT INTO place_name_states
    (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
    VALUES ('editorial:zapogostye:display-name', ?, ?, NULL, NULL, NULL, NULL, 'editorial', ?)`)
    .run(placeId, nameId, position);
};
