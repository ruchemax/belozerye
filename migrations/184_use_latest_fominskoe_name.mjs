export const up = (db) => {
  const placeId = "fomkin";
  const latest = db.prepare(`SELECT names.name, states.type_code
    FROM place_name_states AS states
    JOIN place_names AS names ON names.id = states.place_name_id
    WHERE states.place_id = ? AND states.assertion_kind = 'observed'
    ORDER BY CAST(substr(states.observed_year, 1, 4) AS INTEGER) DESC, states.position DESC
    LIMIT 1`).get(placeId);
  if (!latest || latest.name !== "Фоминское") throw new Error("The latest observed name for Fomkin was not found.");
  db.prepare("UPDATE places SET name = ?, name_origin = 'observed', type_code = ? WHERE id = ?")
    .run(latest.name, latest.type_code, placeId);
};
