export const up = (db) => {
  const update = db.prepare("UPDATE churches SET source_anchor = ? WHERE id = ?");
  update.run("place-1", "bogoyavlenie-ugol");
  update.run("place-1", "george-victorious-ugol");
};
