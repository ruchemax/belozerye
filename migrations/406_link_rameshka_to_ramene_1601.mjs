export const formatDocument = (html) => html.replace(
  /(<h3\b[^>]*id="kirillov-1601-fragment-020-heading"[^>]*>)(Деревня Рамешка)(<\/h3>)/u,
  '$1<a class="place-title-link" href="../../places/ramene/">$2</a>$3'
);

export const up = (db) => {
  const bookId = "kirillov-1601";
  const fragmentId = "kirillov-1601-fragment-020";
  const mentionId = "kirillov-1601-mention-020-ramene";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document || !db.prepare("SELECT 1 FROM places WHERE id='ramene'").get()) {
    throw new Error("The 1601 source or Ramene card was not found.");
  }
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The Rameshka heading was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html, bookId);
  db.prepare(`INSERT INTO mentions (id,place_id,fragment_id,source_name,match_reliability)
    VALUES (?,'ramene',?,'Деревня Рамешка','exact')`).run(mentionId, fragmentId);
  const modelMention = "kirillov-1601-mention-021-savinskoe";
  db.prepare(`INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key,display_label)
    SELECT ?,administrative_unit_id,context_key,display_label FROM mention_administrative_units WHERE mention_id=?`)
    .run(mentionId, modelMention);
  db.prepare(`INSERT INTO mention_land_categories (mention_id,position,code,label,display_period)
    SELECT ?,position,code,label,display_period FROM mention_land_categories WHERE mention_id=?`)
    .run(mentionId, modelMention);
  db.prepare(`INSERT INTO mention_land_category_owners (mention_id,land_category_position,land_owner_id,position)
    SELECT ?,land_category_position,land_owner_id,position FROM mention_land_category_owners WHERE mention_id=?`)
    .run(mentionId, modelMention);
  let nameId = db.prepare("SELECT id FROM place_names WHERE place_id='ramene' AND name='Рамешка'").get()?.id;
  if (!nameId) {
    nameId = `attested:${mentionId}`;
    db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,'ramene','Рамешка','ru','attested')").run(nameId);
  }
  const position = db.prepare("SELECT MAX(position)+1 AS n FROM place_name_states WHERE place_id='ramene'").get().n;
  db.prepare(`INSERT INTO place_name_states
    (id,place_id,place_name_id,type_code,source_mention_id,observed_year,display_period,assertion_kind,position)
    VALUES (?,'ramene',?,'village',?,'1601','1601','observed',?)`)
    .run(`observed:${mentionId}`,nameId,mentionId,position);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after linking Rameshka.");
};
