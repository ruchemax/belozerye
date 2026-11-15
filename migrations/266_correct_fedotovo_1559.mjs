export const formatDocument = (html) => html.replace(
  /(<h3\b[^>]*id="kirillov-1559-fragment-009-heading"[^>]*>)([\s\S]*?)(<\/h3>)/u,
  (_match, opening, title, closing) => opening + title.replace("Деревня Федотова",
    'Деревня Федотова <span class="name-variant">[Федотово]</span>') + closing
).replace(
  /(<a\b[^>]*href="#kirillov-1559-fragment-009-heading"[^>]*>)Деревня Федотова(<\/a>)/u,
  "$1Деревня Федотово$2"
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const fragmentId = "kirillov-1559-fragment-009";
  const mentionId = "kirillov-1559-mention-009";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
  const sourceName = "Деревня Федотова [Федотово]";
  db.prepare("UPDATE mentions SET source_name = ?, historical_name_override = ? WHERE id = ?")
    .run(sourceName, "Деревня Федотово", mentionId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id = ?").get(fragmentId);
  db.prepare("UPDATE fragments SET raw_json = ? WHERE id = ?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: sourceName }), fragmentId);
  const name = db.prepare("SELECT id FROM place_names WHERE place_id = 'fedotov' AND name = 'Федотово'").get();
  if (!name) throw new Error("The Fedotovo name was not found.");
  db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE source_mention_id = ?").run(name.id, mentionId);
};
