export const formatDocument = (html) => html.replaceAll(
  'Ступная <span class="name-variant">[Ступное]</span>', "Ступная"
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const fragmentId = "kirillov-1559-fragment-023";
  const mentionId = "kirillov-1559-mention-023";
  const placeId = "pustosh-stupnevo-1626-85";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  if (!document || !fragment) throw new Error("The 1559 Stupnaya record was not found.");
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The expected Stupnaya name variant was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  db.prepare("UPDATE mentions SET source_name='Деревня Ступная',historical_name_override=NULL WHERE id=?").run(mentionId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: "Деревня Ступная" }),fragmentId);
  let nameId = db.prepare("SELECT id FROM place_names WHERE place_id=? AND name='Ступная'").get(placeId)?.id;
  if (!nameId) {
    nameId = "attested:stupnaya:1559-023";
    db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,?,'Ступная','ru','attested')").run(nameId,placeId);
  }
  db.prepare("UPDATE place_name_states SET place_name_id=? WHERE source_mention_id=?").run(nameId,mentionId);
};
