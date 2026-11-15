export const formatDocument = (html) => html.replace(
  /(<h3\b[^>]*id="folios-547-561-place-98-heading"[^>]*>)([\s\S]*?)(<\/h3>)/u,
  (_match, opening, title, closing) => opening + title.replace(/Верещигино(?! \[Верещагино\])/u,
    "Верещигино [Верещагино]") + closing
);

export const up = (db) => {
  const bookId = "belozersky-1626";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-98";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1626/27 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
  db.prepare("UPDATE mentions SET source_name = ?, historical_name_override = ? WHERE id = ?")
    .run("Пустошь Верещигино [Верещагино]", "Пустошь Верещагино", mentionId);
  const name = db.prepare("SELECT id FROM place_names WHERE place_id = 'voroshnino' AND name = 'Верещагино'").get();
  if (!name) throw new Error("The Vereshchagino name was not found.");
  db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE source_mention_id = ?").run(name.id, mentionId);
  db.prepare("UPDATE places SET name = 'Верещагино' WHERE id = 'voroshnino' AND name = 'Верещигино'").run();
};
