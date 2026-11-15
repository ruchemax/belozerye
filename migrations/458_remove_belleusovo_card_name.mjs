export const up = (db) => {
  const placeId = "pustosh-beusovo-1626-65";
  const name = db.prepare("SELECT id FROM place_names WHERE place_id=? AND name=?")
    .get(placeId,"Беллеусово");
  if (!name) throw new Error("The Belleusovo name was not found.");
  db.prepare("DELETE FROM place_name_states WHERE place_id=? AND place_name_id=?").run(placeId,name.id);
  db.prepare("DELETE FROM place_names WHERE id=?").run(name.id);
};
