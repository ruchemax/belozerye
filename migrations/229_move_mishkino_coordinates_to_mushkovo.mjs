export const up = (db) => {
  const sourceId = "pustosh-mishkino-1626-62";
  const targetId = "pustosh-mushkovo-1626-75";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(targetId)) {
    throw new Error("The Mushkovo place was not found.");
  }
  if (!db.prepare("SELECT 1 FROM place_geometries WHERE place_id = ?").get(sourceId)) {
    throw new Error("The Mishkino coordinates were not found.");
  }
  db.prepare("UPDATE place_geometries SET place_id = ? WHERE place_id = ?").run(targetId, sourceId);
};
