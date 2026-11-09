export const up = (db) => {
  const placeId = "fedotov";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-42";
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = ?").get(mentionId, placeId)) {
    throw new Error("The 1626/27 Fedotovo record was not found.");
  }
  db.prepare("UPDATE places SET type_code = 'selishche' WHERE id = ?").run(placeId);
  db.prepare("UPDATE place_name_states SET type_code = 'selishche' WHERE source_mention_id = ? AND assertion_kind = 'observed'")
    .run(mentionId);
  db.prepare("UPDATE mentions SET historical_name_override = 'селище Федотово' WHERE id = ?").run(mentionId);
  const longitude = 38 + 24 / 60 + 9.185 / 3600;
  const latitude = 59 + 8 / 60 + 9.191 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(placeId, longitude, latitude);
};
