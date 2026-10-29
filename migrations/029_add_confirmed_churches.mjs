export const up = (db) => {
  db.exec(`CREATE TABLE churches (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, book_slug TEXT NOT NULL, book_title TEXT NOT NULL, source_anchor TEXT NOT NULL);
CREATE TABLE church_geometries (church_id TEXT PRIMARY KEY REFERENCES churches(id) ON DELETE CASCADE, longitude REAL NOT NULL, latitude REAL NOT NULL, source TEXT NOT NULL);`);
  const church = db.prepare("INSERT INTO churches VALUES (?, ?, ?, ?, ?, ?)");
  const point = db.prepare("INSERT INTO church_geometries VALUES (?, ?, ?, ?)");
  const rows = [
    ["ilya-prophet-charoma", "ilya-prophet-charoma", "Ильи Пророка", "belozersky_uezd-1544", "Сотная из писцовых книг Белозерского уезда (1544 г.)", "place-1-11", 38.619834166667, 59.341693611111, "координаты Чаромы"],
    ["nativity-bogoroditsy-churovskaya", "nativity-bogoroditsy-churovskaya", "Рождества Богородицы (Пречистой)", "belozersky_uezd-1626-27", "Писцовая книга Белозерского уезда (1626/27 г.)", "patriarchal-churchyard", 38.597633427041, 59.258038989811, "координаты погоста Рождества Богородицы"]
  ];
  for (const [id, slug, name, bookSlug, bookTitle, anchor, longitude, latitude, source] of rows) { church.run(id, slug, name, bookSlug, bookTitle, anchor); point.run(id, longitude, latitude, source); }
};
