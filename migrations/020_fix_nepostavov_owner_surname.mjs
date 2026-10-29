export const up = (db) => {
  db.prepare("UPDATE land_owners SET name = ? WHERE id = ?")
    .run("Михайло Непоставов Чюровской", "mikhailo-nepostavov-churovsky");
};
