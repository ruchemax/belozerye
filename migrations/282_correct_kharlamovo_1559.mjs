export const formatDocument = (html) => html.replaceAll("Харламове", "Харламово");

export const up = (db) => {
  const bookId = "kirillov-1559";
  const placeId = "pochinok-kharlamov-u-kolentsa";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
  for (const row of db.prepare(`SELECT m.id, m.source_name, m.historical_name_override,
    f.id AS fragment_id, f.raw_json FROM mentions m JOIN fragments f ON f.id = m.fragment_id
    WHERE m.place_id = ? AND f.book_id = ?`).all(placeId, bookId)) {
    db.prepare("UPDATE mentions SET source_name = ?, historical_name_override = ? WHERE id = ?")
      .run(formatDocument(row.source_name), row.historical_name_override === null ? null : formatDocument(row.historical_name_override), row.id);
    const raw = JSON.parse(row.raw_json);
    if (raw.source_name_override) raw.source_name_override = formatDocument(raw.source_name_override);
    db.prepare("UPDATE fragments SET raw_json = ? WHERE id = ?").run(JSON.stringify(raw), row.fragment_id);
  }
  db.prepare("UPDATE place_names SET name = 'Харламово' WHERE place_id = ? AND name = 'Харламове'").run(placeId);
};
