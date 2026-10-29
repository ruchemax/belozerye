export const up = (db) => {
  db.prepare("UPDATE land_owners SET name = ? WHERE id = ?")
    .run("Чюровской", "mikhailo-nepostavov-churovsky");
};
