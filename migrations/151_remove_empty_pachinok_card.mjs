export const up = (db) => {
  const oldId = "derevnya-pachinok-pochinok-1626-54";
  if (db.prepare("SELECT 1 FROM mentions WHERE place_id = ?").get(oldId)) {
    throw new Error("The Pachinok source card still has mentions and cannot be removed.");
  }
  db.prepare("DELETE FROM places WHERE id = ?").run(oldId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after removing the empty Pachinok card.");
};
