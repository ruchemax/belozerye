export const formatDocument = (html) => html.replaceAll(
  "В деревне Голобокой", 'В деревне Голобокой <span class="name-variant">[Голобокое]</span>'
);

export const up = (db) => {
  const bookId = "kirillov-1601";
  const fragmentId = "kirillov-1601-fragment-073";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  if (!document || !fragment) throw new Error("The 1601 Golobokaya record was not found.");
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The expected Golobokaya heading was not found.");
  const sourceName = "В деревне Голобокой [Голобокое]";
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html, bookId);
  db.prepare("UPDATE mentions SET source_name=? WHERE fragment_id=?").run(sourceName, fragmentId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: sourceName }), fragmentId);
};
