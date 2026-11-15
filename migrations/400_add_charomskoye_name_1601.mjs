const original = "Деревня Большей Двор, Чяромские";
const sourceName = `${original} [Чяромское]`;

export const formatDocument = (html) => {
  if (!html.includes(original)) throw new Error("The 1601 Charomskie record was not found.");
  return html.replaceAll(original, `${original} <span class="name-variant">[Чяромское]</span>`);
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const fragmentId = "kirillov-1601-fragment-003";
  const mentionId = "kirillov-1601-mention-003-charoma";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  const name = db.prepare("SELECT id FROM place_names WHERE place_id='charoma' AND name='Чяромское'").get();
  if (!document || !fragment || !name) throw new Error("The Charomskoye source or name was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(formatDocument(document.html), bookId);
  db.prepare("UPDATE mentions SET source_name=? WHERE id=?").run(sourceName, mentionId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: sourceName }), fragmentId);
  const position = db.prepare("SELECT MAX(position)+1 AS n FROM place_name_states WHERE place_id='charoma'").get().n;
  db.prepare(`INSERT INTO place_name_states
    (id,place_id,place_name_id,type_code,source_mention_id,observed_year,display_period,assertion_kind,position)
    VALUES (?,'charoma',?,'village',?,'1601','1601','observed',?)`)
    .run("observed:kirillov-1601-mention-003-charoma:charomskoye", name.id, mentionId, position);
};
