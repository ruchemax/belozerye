export const formatDocument = (html) => html.replaceAll("[Чаромскые]", "[Чяромское]")
  .replace(/(<a\b[^>]*href="#kirillov-1559-fragment-080-heading"[^>]*>)Деревня Чяромские(<\/a>)/u,
    "$1Деревня Чяромское$2");

export const up = (db) => {
  const bookId = "kirillov-1559";
  const mentionId = "kirillov-1559-mention-080";
  const fragmentId = "kirillov-1559-fragment-080";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
  const sourceName = "Деревня Чяромские [Чяромское]";
  db.prepare("UPDATE mentions SET source_name = ?, historical_name_override = ? WHERE id = ?")
    .run(sourceName, "Деревня Чяромское", mentionId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id = ?").get(fragmentId);
  db.prepare("UPDATE fragments SET raw_json = ? WHERE id = ?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: sourceName }), fragmentId);
  const name = db.prepare("SELECT id FROM place_names WHERE place_id = 'charoma' AND name = 'Чяромское'").get();
  if (!name) throw new Error("The Charomskoye name was not found.");
  db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE source_mention_id = ?").run(name.id, mentionId);
};
