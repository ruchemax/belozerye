export const up = (db) => {
  const oldId = "pochinok-ugla";
  const records = [
    {
      number: 34,
      placeId: "derevnya-pochinok-na-rechke-na-chyurovke-1626-34",
      name: "Починок",
      coordinates: [38 + 30 / 60 + 52.332 / 3600, 59 + 14 / 60 + 24.844 / 3600]
    },
    {
      number: 54,
      placeId: "derevnya-pachinok-pochinok-1626-54",
      name: "Пачинок"
    }
  ];
  const insertState = db.prepare(`INSERT INTO place_name_states
    (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const record of records) {
    const mentionId = `belozersky-1626-mention-folios-547-561-place-${record.number}`;
    const mention = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(mentionId);
    if (mention?.place_id !== oldId) throw new Error(`The source mention ${mentionId} was not found on the Pochinok card.`);
    const states = db.prepare("SELECT states.*, names.name FROM place_name_states states JOIN place_names names ON names.id = states.place_name_id WHERE states.source_mention_id = ? ORDER BY states.position").all(mentionId);
    db.prepare(`INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
      VALUES (?, ?, ?, 'observed', 'village', 'unknown')`).run(record.placeId, record.placeId, record.name);
    db.prepare("DELETE FROM place_name_states WHERE source_mention_id = ?").run(mentionId);
    db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'exact' WHERE id = ?").run(record.placeId, mentionId);
    for (const [position, state] of states.entries()) {
      const nameId = `attested:split-pochinok:${record.number}:${position}`;
      db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, ?, 'ru', 'attested')")
        .run(nameId, record.placeId, state.name);
      insertState.run(state.id, record.placeId, nameId, state.type_code, mentionId,
        state.observed_year, state.display_period, state.assertion_kind, position);
    }
    if (record.coordinates) {
      db.prepare("INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)")
        .run(record.placeId, ...record.coordinates);
    }
  }
  db.prepare(`DELETE FROM place_names WHERE place_id = ? AND name <> 'Починок'
    AND NOT EXISTS (SELECT 1 FROM place_name_states WHERE place_name_id = place_names.id)`).run(oldId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after splitting Pochinok records.");
};
