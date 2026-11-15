export const formatDocument = (html) => html.replaceAll(
  'Чяромские <span class="name-variant">[Чяромское]</span>', "Чяромские"
);

export const up = (db) => {
  const bookId = "kirillov-1601";
  const fragmentId = "kirillov-1601-fragment-003";
  const mentionId = "kirillov-1601-mention-003-charoma";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  const oldName = db.prepare("SELECT id FROM place_names WHERE place_id='charoma' AND name='Чяромское'").get();
  const name = db.prepare("SELECT id FROM place_names WHERE place_id='charoma' AND name='Чяромские'").get();
  if (!document || !fragment || !oldName || !name) throw new Error("The 1601 Charomskie source or names were not found.");
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The expected Charomskie name variant was not found.");
  const sourceName = "Деревня Большей Двор, Чяромские";
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  db.prepare("UPDATE mentions SET source_name=? WHERE id=?").run(sourceName,mentionId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: sourceName }),fragmentId);
  db.prepare("UPDATE place_name_states SET place_name_id=? WHERE source_mention_id=? AND place_name_id=?")
    .run(name.id,mentionId,oldName.id);
};
