export const up = (db) => {
  const mentionId = "belozersky-1626-mention-folios-547-561-place-42";
  if (!db.prepare("SELECT 1 FROM places WHERE id = 'selishche'").get()) throw new Error("The Selishche card was not found.");
  db.prepare("UPDATE places SET type_code = 'village' WHERE id = 'fedotov'").run();
  db.prepare("UPDATE place_name_states SET type_code = 'village' WHERE source_mention_id = ? AND assertion_kind = 'observed'")
    .run(mentionId);
  db.prepare("UPDATE mentions SET historical_name_override = NULL WHERE id = ?").run(mentionId);
  db.prepare("UPDATE place_geometries SET longitude = 38.616118924726, latitude = 59.33365599642 WHERE place_id = 'fedotov'").run();

  const longitude = 38 + 24 / 60 + 9.185 / 3600;
  const latitude = 59 + 8 / 60 + 9.191 / 3600;
  db.prepare(`INSERT INTO place_geometries (place_id, longitude, latitude) VALUES ('selishche', ?, ?)
    ON CONFLICT(place_id) DO UPDATE SET longitude = excluded.longitude, latitude = excluded.latitude`)
    .run(longitude, latitude);
};
