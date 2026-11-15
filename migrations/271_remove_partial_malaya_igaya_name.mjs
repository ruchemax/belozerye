export const up = (db) => {
  const placeId = "derevnya-1626-6";
  const fullName = db.prepare(`SELECT 1 FROM place_name_states s
    JOIN place_names n ON n.id = s.place_name_id
    WHERE s.place_id = ? AND s.observed_year = '1559' AND n.name = 'Игая Малая'`).get(placeId);
  if (!fullName) throw new Error("The complete Malaya Igaya name for 1559 was not found.");
  db.prepare(`DELETE FROM place_name_states WHERE place_id = ? AND observed_year = '1559'
    AND source_mention_id = 'kirillov-1559-mention-110'
    AND place_name_id IN (SELECT id FROM place_names WHERE place_id = ? AND name = 'Игая')`)
    .run(placeId, placeId);
};
