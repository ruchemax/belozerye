export const formatDocument = (html) => html.replace(
  /(<h3\b[^>]*id="kirillov-1601-fragment-016-heading"[^>]*>[\s\S]*?href=")\.\.\/\.\.\/places\/igaya\//u,
  "$1../../places/derevnya-1626-6/"
);

export const up = (db) => {
  const bookId = "kirillov-1601";
  const fragmentId = "kirillov-1601-fragment-016";
  const target = "derevnya-1626-6";
  const mention = db.prepare("SELECT id FROM mentions WHERE fragment_id=? AND place_id='igaya'").get(fragmentId);
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!mention || !document || !db.prepare("SELECT 1 FROM places WHERE id=?").get(target)) {
    throw new Error("The Igoya attestation or Malaya Igoya card was not found.");
  }
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The Igoya source link was not found.");
  let nameId = db.prepare("SELECT id FROM place_names WHERE place_id=? AND name='Игоя'").get(target)?.id;
  if (!nameId) {
    nameId = "attested:malaya-igoya:1601-016";
    db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,?,'Игоя','ru','attested')")
      .run(nameId,target);
  }
  const position = db.prepare("SELECT COALESCE(MAX(position),-1)+1 AS n FROM place_name_states WHERE place_id=?").get(target).n;
  db.exec("PRAGMA defer_foreign_keys=ON");
  db.prepare("UPDATE mentions SET place_id=? WHERE id=?").run(target,mention.id);
  db.prepare("UPDATE place_name_states SET place_id=?,place_name_id=?,position=? WHERE source_mention_id=?")
    .run(target,nameId,position,mention.id);
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after moving the Igoya attestation.");
};
