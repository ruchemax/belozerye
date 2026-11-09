export const up = (db) => {
  const updates = [
    { placeId: "grishiev", expected: "Гришнево" },
    { placeId: "pochinok-ugla", expected: "Пачинок" }
  ];
  const latestName = db.prepare(`SELECT names.name, states.type_code
    FROM place_name_states AS states
    JOIN place_names AS names ON names.id = states.place_name_id
    WHERE states.place_id = ? AND states.assertion_kind = 'observed'
    ORDER BY CAST(substr(states.observed_year, 1, 4) AS INTEGER) DESC, states.position DESC
    LIMIT 1`);
  const setPlace = db.prepare("UPDATE places SET name = ?, name_origin = 'observed', type_code = ? WHERE id = ?");
  for (const { placeId, expected } of updates) {
    const latest = latestName.get(placeId);
    if (!latest || latest.name !== expected) throw new Error(`The expected latest name for ${placeId} was not found.`);
    setPlace.run(latest.name, latest.type_code, placeId);
  }
};
