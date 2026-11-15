export const formatDocument = (html) => html.replace(
  /(<h3\b[^>]*id="kirillov-1601-fragment-023-heading"[^>]*>)(Деревня Горка)(<\/h3>)/u,
  '$1<a class="place-title-link" href="../../places/gorka-kolinets-1601/">$2</a>$3'
);

export const up = (db) => {
  const bookId = "kirillov-1601";
  const placeId = "gorka-kolinets-1601";
  const fragmentId = "kirillov-1601-fragment-023";
  const mentionId = "kirillov-1601-mention-023-gorka-kolinets";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document || db.prepare("SELECT 1 FROM mentions WHERE fragment_id=?").get(fragmentId)) {
    throw new Error("The unlinked Gorka village record was not found.");
  }
  const html = formatDocument(document.html);
  if (html === document.html) throw new Error("The Gorka village heading was not found.");
  db.prepare("INSERT INTO places (id,slug,name,name_origin,type_code,status_code) VALUES (?,?,'Горка','observed','village','unknown')")
    .run(placeId,placeId);
  db.prepare("INSERT INTO place_geometries (place_id,longitude,latitude) VALUES (?,?,?)")
    .run(placeId,38+28/60+58.283/3600,59+27/60+53.694/3600);
  db.prepare(`INSERT INTO mentions (id,place_id,fragment_id,source_name,match_reliability)
    VALUES (?,?,?,'Деревня Горка','exact')`).run(mentionId,placeId,fragmentId);
  const modelMention = "kirillov-1601-mention-021-savinskoe";
  db.prepare(`INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key,display_label)
    SELECT ?,administrative_unit_id,context_key,display_label FROM mention_administrative_units WHERE mention_id=?`).run(mentionId,modelMention);
  db.prepare(`INSERT INTO mention_land_categories (mention_id,position,code,label,display_period)
    SELECT ?,position,code,label,display_period FROM mention_land_categories WHERE mention_id=?`).run(mentionId,modelMention);
  db.prepare(`INSERT INTO mention_land_category_owners (mention_id,land_category_position,land_owner_id,position)
    SELECT ?,land_category_position,land_owner_id,position FROM mention_land_category_owners WHERE mention_id=?`).run(mentionId,modelMention);
  const nameId = `attested:${mentionId}`;
  db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,?,'Горка','ru','attested')").run(nameId,placeId);
  db.prepare(`INSERT INTO place_name_states
    (id,place_id,place_name_id,type_code,source_mention_id,observed_year,display_period,assertion_kind,position)
    VALUES (?,?,?,'village',?,'1601','1601','observed',0)`).run(`observed:${mentionId}`,placeId,nameId,mentionId);
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after adding the Gorka card.");
};
