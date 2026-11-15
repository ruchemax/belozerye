const records = [
  [59,"pavlovskaya-1601","Павловская"],
  [96,"mitkino-1601","Митькино"],
  [97,"puminovo-1601","Пуминово"],
  [98,"shelepino-1601","Шелепино"],
  [99,"dryuchino-1601","Дрючино"]
];
const fragmentIdFor = (number) => `kirillov-1601-fragment-${String(number).padStart(3,"0")}`;

export const formatDocument = (html) => {
  let result = html;
  for (const [number,slug,name] of records) {
    const pattern = new RegExp(`(<h3\\b[^>]*id="${fragmentIdFor(number)}-heading"[^>]*>)(Пустошь ${name})(<\\/h3>)`,"u");
    if (!pattern.test(result)) throw new Error(`The unlinked ${name} heading was not found.`);
    result = result.replace(pattern, `$1<a class="place-title-link" href="../../places/${slug}/">$2</a>$3`);
  }
  return result;
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  const html = formatDocument(document.html);
  const modelMention = "kirillov-1601-mention-053-peshkov";
  for (const [number,placeId,name] of records) {
    const fragmentId = fragmentIdFor(number);
    const mentionId = `kirillov-1601-mention-${String(number).padStart(3,"0")}-${placeId}`;
    if (db.prepare("SELECT 1 FROM mentions WHERE fragment_id=?").get(fragmentId)) throw new Error(`The ${name} record is already linked.`);
    db.prepare("INSERT INTO places (id,slug,name,name_origin,type_code,status_code) VALUES (?,?,?,'observed','pustosh','unknown')")
      .run(placeId,placeId,name);
    db.prepare("INSERT INTO mentions (id,place_id,fragment_id,source_name,match_reliability) VALUES (?,?,?,?,'exact')")
      .run(mentionId,placeId,fragmentId,`Пустошь ${name}`);
    db.prepare(`INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key,display_label)
      SELECT ?,administrative_unit_id,context_key,display_label FROM mention_administrative_units WHERE mention_id=?`).run(mentionId,modelMention);
    db.prepare(`INSERT INTO mention_land_categories (mention_id,position,code,label,display_period)
      SELECT ?,position,code,label,display_period FROM mention_land_categories WHERE mention_id=?`).run(mentionId,modelMention);
    db.prepare(`INSERT INTO mention_land_category_owners (mention_id,land_category_position,land_owner_id,position)
      SELECT ?,land_category_position,land_owner_id,position FROM mention_land_category_owners WHERE mention_id=?`).run(mentionId,modelMention);
    const nameId = `attested:${mentionId}`;
    db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,?,?,'ru','attested')").run(nameId,placeId,name);
    db.prepare(`INSERT INTO place_name_states
      (id,place_id,place_name_id,type_code,source_mention_id,observed_year,display_period,assertion_kind,position)
      VALUES (?,?,?,'pustosh',?,'1601','1601','observed',0)`).run(`observed:${mentionId}`,placeId,nameId,mentionId);
  }
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  const unlinked = db.prepare(`SELECT id FROM fragments f WHERE book_id=?
    AND NOT EXISTS (SELECT 1 FROM mentions m WHERE m.fragment_id=f.id)
    AND json_extract(raw_json,'$.church_source_only') IS NOT 1`).all(bookId);
  if (unlinked.length) throw new Error(`Unlinked settlement records remain: ${unlinked.map(row=>row.id).join(", ")}.`);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after adding the remaining 1601 cards.");
};
