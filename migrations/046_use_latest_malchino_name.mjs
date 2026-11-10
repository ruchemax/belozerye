export const up = (db) => {
  const placeId = "malchino";
  const latestStateId = "observed:belozersky-1626-mention-folios-547-561-place-21:0";
  const otherNameStateId = "observed:belozersky-1626-mention-folios-547-561-place-21:1";
  const earlierStateId = "observed:mention-belozersky-1544-place-5-2";
  const latestName = db.prepare(`
    SELECT names.name FROM place_name_states states
    JOIN place_names names ON names.id = states.place_name_id
    WHERE states.id = ? AND states.place_id = ?
  `).get(latestStateId, placeId)?.name;
  if (latestName !== "Мальцово") {
    throw new Error("Последнее имя Малчина не найдено в ожидаемом виде.");
  }
  db.prepare("UPDATE places SET name = ?, name_origin = 'observed' WHERE id = ?")
    .run(latestName, placeId);
  db.prepare("UPDATE place_name_states SET position = 0 WHERE id = ? AND place_id = ?")
    .run(latestStateId, placeId);
  db.prepare("UPDATE place_name_states SET position = 1 WHERE id = ? AND place_id = ?")
    .run(otherNameStateId, placeId);
  db.prepare("UPDATE place_name_states SET position = 2 WHERE id = ? AND place_id = ?")
    .run(earlierStateId, placeId);
};
