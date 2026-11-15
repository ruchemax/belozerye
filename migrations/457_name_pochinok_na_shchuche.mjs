export const up = (db) => {
  const result = db.prepare("UPDATE places SET name=? WHERE id=? AND name=?")
    .run("Починок на Щучье","na-shchuche","на Щучье");
  if (result.changes !== 1) throw new Error("The expected Na Shchuchye card was not found.");
};
