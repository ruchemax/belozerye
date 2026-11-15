export const up = (db) => {
  const placeId = "na-shchuche";
  const latest = db.prepare(`SELECT n.name,s.type_code FROM place_name_states s
    JOIN place_names n ON n.id=s.place_name_id
    WHERE s.place_id=? AND s.assertion_kind='observed'
    ORDER BY CAST(s.observed_year AS INTEGER) DESC,s.position ASC LIMIT 1`).get(placeId);
  if (!latest) throw new Error("No observed name was found for Shchuchye.");
  db.prepare("UPDATE places SET name=?,type_code=?,name_origin='observed' WHERE id=?")
    .run(latest.name,latest.type_code,placeId);
};
