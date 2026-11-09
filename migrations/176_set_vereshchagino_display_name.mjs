export const up = (db) => {
  const placeId = "pustosh-vereshchigino-vereshchagino-1626-98";
  const row = db.prepare("SELECT name FROM places WHERE id = ?").get(placeId);
  if (!row || row.name !== "Верещигино") throw new Error("The Vereshchigino card was not found in its expected state.");
  db.prepare("UPDATE places SET name = 'Верещагино', name_origin = 'editorial' WHERE id = ?").run(placeId);
  const nameId = "editorial:pustosh-vereshchigino-vereshchagino-1626-98:Верещагино";
  db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, 'Верещагино', 'ru', 'editorial')")
    .run(nameId, placeId);
  const position = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS value FROM place_name_states WHERE place_id = ?")
    .get(placeId).value;
  db.prepare(`INSERT INTO place_name_states
    (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
    VALUES (?, ?, ?, NULL, NULL, NULL, NULL, 'editorial', ?)`)
    .run("editorial:pustosh-vereshchigino-vereshchagino-1626-98", placeId, nameId, position);
};
