export const formatDocument = (html) => html.replaceAll(
  'Чяромские <span class="name-variant">[Чяромское]</span>', "Чяромские"
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const fragmentId = "kirillov-1559-fragment-080";
  const mentionId = "kirillov-1559-mention-080";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  if (!document || !fragment) throw new Error("The 1559 Charomskie record was not found.");
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The expected Charomskie name variant was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  db.prepare("UPDATE mentions SET source_name='Деревня Чяромские',historical_name_override=NULL WHERE id=?").run(mentionId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: "Деревня Чяромские" }),fragmentId);
  let nameId = db.prepare("SELECT id FROM place_names WHERE place_id='charoma' AND name='Чяромские'").get()?.id;
  if (!nameId) {
    nameId = "attested:charomskie:1559-080";
    db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,'charoma','Чяромские','ru','attested')").run(nameId);
  }
  db.prepare("UPDATE place_name_states SET place_name_id=? WHERE source_mention_id=?").run(nameId,mentionId);
};
