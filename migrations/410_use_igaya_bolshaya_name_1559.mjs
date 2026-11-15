export const formatDocument = (html) => html.replaceAll(
  'Игая <span class="name-variant">[Игоя]</span> Большая', "Игая Большая"
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const fragmentId = "kirillov-1559-fragment-008";
  const mentionId = "kirillov-1559-mention-008";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  if (!document || !fragment) throw new Error("The 1559 Igaya Bolshaya record was not found.");
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The expected Igaya name variant was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  db.prepare("UPDATE mentions SET source_name='Деревня Игая Большая',historical_name_override=NULL WHERE id=?").run(mentionId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: "Деревня Игая Большая" }),fragmentId);
  let nameId = db.prepare("SELECT id FROM place_names WHERE place_id='igaya' AND name='Игая Большая'").get()?.id;
  if (!nameId) {
    nameId = "attested:igaya-bolshaya:1559-008";
    db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,'igaya','Игая Большая','ru','attested')").run(nameId);
  }
  db.prepare("UPDATE place_name_states SET place_name_id=? WHERE source_mention_id=?").run(nameId,mentionId);
};
