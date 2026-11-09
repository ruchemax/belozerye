export const up = (db) => {
  const sourceId = "drozdovo";
  const targetId = "drozdovo-churovka";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(targetId)) {
    throw new Error("The 1626 Drozdovo on Churovka place was not found.");
  }
  if (!db.prepare("SELECT 1 FROM place_geometries WHERE place_id = ?").get(sourceId)) {
    throw new Error("The Drozdovo coordinates to transfer were not found.");
  }
  db.prepare("UPDATE place_geometries SET place_id = ? WHERE place_id = ?").run(targetId, sourceId);
};
