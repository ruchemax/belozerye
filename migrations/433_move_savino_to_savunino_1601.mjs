export const formatDocument = (html) => html.replace(
  /(<h3\b[^>]*id="kirillov-1601-fragment-085-heading"[^>]*>[\s\S]*?href=")\.\.\/\.\.\/places\/savin\//u,
  "$1../../places/saunkin/"
);

export const up = (db) => {
  const bookId = "kirillov-1601";
  const mention = db.prepare("SELECT id FROM mentions WHERE fragment_id=? AND place_id='savin'")
    .get("kirillov-1601-fragment-085");
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!mention || !document || !db.prepare("SELECT 1 FROM places WHERE id='saunkin'").get()) {
    throw new Error("The Savino attestation or Savunino card was not found.");
  }
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The Savino source link was not found.");
  let nameId = db.prepare("SELECT id FROM place_names WHERE place_id='saunkin' AND name='Савино'").get()?.id;
  if (!nameId) {
    nameId = "attested:savunino:savino-1601";
    db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,'saunkin','Савино','ru','attested')").run(nameId);
  }
  const position = db.prepare("SELECT COALESCE(MAX(position),-1)+1 AS n FROM place_name_states WHERE place_id='saunkin'").get().n;
  db.exec("PRAGMA defer_foreign_keys=ON");
  db.prepare("UPDATE mentions SET place_id='saunkin',match_reliability='exact',match_reason=NULL WHERE id=?").run(mention.id);
  db.prepare("UPDATE place_name_states SET place_id='saunkin',place_name_id=?,position=? WHERE source_mention_id=?")
    .run(nameId,position,mention.id);
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  db.prepare(`DELETE FROM place_names WHERE place_id='savin' AND name='Савино'
    AND NOT EXISTS (SELECT 1 FROM place_name_states WHERE place_name_id=place_names.id)`).run();
  if (!db.prepare("SELECT 1 FROM mentions WHERE place_id='savin'").get()) throw new Error("The separate Savin card lost its source.");
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after moving Savino.");
};
