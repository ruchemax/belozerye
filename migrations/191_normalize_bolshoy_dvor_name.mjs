export const up = (db) => {
  const placeId = "pustosh-bollshoy-bolshoy-dvor-na-rechke-na-pizdavke-1626-39";
  const nameId = "attested:belozersky-1626-mention-folios-547-561-place-39:0";
  const state = db.prepare("SELECT place_id, name FROM place_names WHERE id = ?").get(nameId);
  if (state?.place_id !== placeId || state.name !== "Боллшой Двор") {
    throw new Error("The expected Bolshoy Dvor name state was not found.");
  }
  db.prepare("UPDATE place_names SET name = 'Большой Двор' WHERE id = ?").run(nameId);
  db.prepare("UPDATE places SET name = 'Большой Двор', name_origin = 'observed' WHERE id = ?").run(placeId);
};
