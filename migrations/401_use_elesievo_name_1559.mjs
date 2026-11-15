export const formatDocument = (html) => html.replaceAll(
  'Елесиево <span class="name-variant">[Елисеево]</span>', "Елесиево"
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const fragmentId = "kirillov-1559-fragment-079";
  const mentionId = "kirillov-1559-mention-079";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  const mention = db.prepare("SELECT match_reason FROM mentions WHERE id=?").get(mentionId);
  const name = db.prepare("SELECT id FROM place_names WHERE place_id='olekseeva' AND name='Елесиево'").get();
  if (!document || !fragment || !mention || !name) throw new Error("The 1559 Elesievo source or name was not found.");
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The expected Elesievo name variant was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html, bookId);
  db.prepare("UPDATE mentions SET source_name=?,historical_name_override=NULL,match_reason=? WHERE id=?")
    .run("Деревня Елесиево", mention.match_reason?.replaceAll("Елисеево", "Елесиево").replaceAll("Елисееве", "Елесиеве") ?? null, mentionId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: "Деревня Елесиево" }), fragmentId);
  db.prepare("UPDATE place_name_states SET place_name_id=? WHERE source_mention_id=?")
    .run(name.id, mentionId);
  db.prepare(`DELETE FROM place_names WHERE place_id='olekseeva' AND name='Елисеево'
    AND NOT EXISTS (SELECT 1 FROM place_name_states WHERE place_name_id=place_names.id)`).run();
};
