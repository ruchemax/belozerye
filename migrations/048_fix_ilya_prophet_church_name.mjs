export const up = (db) => {
  db.prepare("UPDATE churches SET name = ? WHERE id = ?")
    .run("Ильи Пророка", "ilya-prophet-charoma");
};
