export const formatDocument = (html) => html.replace(
  /(<h3\b[^>]*id="kirillov-1601-fragment-016-heading"[^>]*>[\s\S]*?href=")\.\.\/\.\.\/places\/derevnya-1626-6\//u,
  "$1../../places/igaya/"
);

export const up = (db) => {
  const bookId = "kirillov-1601";
  const fragmentId = "kirillov-1601-fragment-016";
  const mention = db.prepare("SELECT id FROM mentions WHERE fragment_id=? AND place_id='derevnya-1626-6'").get(fragmentId);
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const name = db.prepare("SELECT id FROM place_names WHERE place_id='igaya' AND name='Игоя'").get();
  if (!mention || !document || !name) throw new Error("The 1601 attestation or Igoya name was not found.");
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The expected Malaya Igoya source link was not found.");
  const position = db.prepare("SELECT COALESCE(MAX(position),-1)+1 AS n FROM place_name_states WHERE place_id='igaya'").get().n;
  db.exec("PRAGMA defer_foreign_keys=ON");
  db.prepare("UPDATE mentions SET place_id='igaya' WHERE id=?").run(mention.id);
  db.prepare("UPDATE place_name_states SET place_id='igaya',place_name_id=?,position=? WHERE source_mention_id=?")
    .run(name.id,position,mention.id);
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  db.prepare(`DELETE FROM place_names WHERE id='attested:malaya-igoya:1601-016'
    AND NOT EXISTS (SELECT 1 FROM place_name_states WHERE place_name_id=place_names.id)`).run();
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after returning the Igoya attestation.");
};
