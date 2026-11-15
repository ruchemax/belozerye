export const up = (db) => {
  const latest = db.prepare(`
    SELECT n.name FROM place_name_states s
    JOIN place_names n ON n.id = s.place_name_id
    WHERE s.place_id = ? AND s.assertion_kind = 'observed'
    ORDER BY CAST(s.observed_year AS INTEGER) DESC, s.position DESC
    LIMIT 1
  `).get("zaopoche");
  if (!latest) throw new Error("No observed name found for Zaopoche / Pochka.");
  db.prepare("UPDATE places SET name = ?, name_origin = 'observed' WHERE id = ?")
    .run(latest.name, "zaopoche");
};
