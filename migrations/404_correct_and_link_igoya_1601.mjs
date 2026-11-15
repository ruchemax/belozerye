export const formatDocument = (html) => html.replaceAll("Деревня Итон", "Деревня Игоя")
  .replace(/(<h3\b[^>]*id="kirillov-1601-fragment-016-heading"[^>]*>)(Деревня Игоя)(<\/h3>)/u,
    '$1<a class="place-title-link" href="../../places/igaya/">$2</a>$3');

export const up = (db) => {
  const bookId = "kirillov-1601";
  const fragmentId = "kirillov-1601-fragment-016";
  const mentionId = "kirillov-1601-mention-016-igaya";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  const name = db.prepare("SELECT id FROM place_names WHERE place_id='igaya' AND name='Игоя'").get();
  if (!document || !fragment || !name) throw new Error("The 1601 source or existing Igoya name was not found.");
  if (!document.html.includes("Деревня Итон")) throw new Error("The expected Iton record was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(formatDocument(document.html), bookId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: "Деревня Игоя" }), fragmentId);
  db.prepare(`INSERT INTO mentions (id,place_id,fragment_id,source_name,match_reliability)
    VALUES (?,'igaya',?,'Деревня Игоя','exact')`).run(mentionId, fragmentId);
  db.prepare(`INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key,display_label)
    SELECT ?,administrative_unit_id,context_key,display_label FROM mention_administrative_units WHERE mention_id=?`)
    .run(mentionId,"kirillov-1601-mention-001-rodino");
  db.prepare(`INSERT INTO mention_land_categories (mention_id,position,code,label,display_period)
    SELECT ?,position,code,label,display_period FROM mention_land_categories WHERE mention_id=?`)
    .run(mentionId,"kirillov-1601-mention-033-igaya");
  db.prepare(`INSERT INTO mention_land_category_owners (mention_id,land_category_position,land_owner_id,position)
    SELECT ?,land_category_position,land_owner_id,position FROM mention_land_category_owners WHERE mention_id=?`)
    .run(mentionId,"kirillov-1601-mention-033-igaya");
  const position = db.prepare("SELECT MAX(position)+1 AS n FROM place_name_states WHERE place_id='igaya'").get().n;
  db.prepare(`INSERT INTO place_name_states
    (id,place_id,place_name_id,type_code,source_mention_id,observed_year,display_period,assertion_kind,position)
    VALUES (?,'igaya',?,'village',?,'1601','1601','observed',?)`)
    .run(`observed:${mentionId}`,name.id,mentionId,position);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after linking Igoya.");
};
