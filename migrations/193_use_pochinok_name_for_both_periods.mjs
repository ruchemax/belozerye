export const up = (db) => {
  const placeId = "pochinok-ugla";
  const stateId = "observed:belozersky-1626-mention-folios-547-561-place-54:0";
  const latestNameId = "attested:split-pochinok:54:0";
  const preferredNameId = "attested:pochinok-ugla:222";
  const state = db.prepare("SELECT place_id, place_name_id FROM place_name_states WHERE id = ?").get(stateId);
  const preferred = db.prepare("SELECT place_id, name FROM place_names WHERE id = ?").get(preferredNameId);
  if (state?.place_id !== placeId || state.place_name_id !== latestNameId || preferred?.place_id !== placeId || preferred.name !== "Починок") {
    throw new Error("The expected Pochinok name states were not found.");
  }
  db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE id = ?").run(preferredNameId, stateId);
  db.prepare("DELETE FROM place_names WHERE id = ?").run(latestNameId);
  db.prepare("UPDATE places SET name = 'Починок', name_origin = 'observed' WHERE id = ?").run(placeId);
};
