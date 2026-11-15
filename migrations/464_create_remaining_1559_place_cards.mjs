const bookId = "kirillov-1559";
const modelMention = "mention:kirillov-1559-seed-koshchievsky-026";
const cards = [
  { slug: "dor-kolenets-1559", name: "Дор", type: "village", records: [["seed", 25, "Деревня Дор"], ["rent", 25, "Деревня Дор"]] },
  { slug: "roslovo-kolenets-1559", name: "Рослово", type: "village", records: [["seed", 28, "Деревня Ивана Рослово"], ["rent", 28, "Деревня Рослово"]] },
  { slug: "strelitsa-kolenets-1559", name: "Стрелица", type: "pochinok", records: [["seed", 30, "Починок Стрелица"]] },
  { slug: "karpov-kolenets-1559", name: "Карпов", type: "pochinok", records: [["seed", 31, "Починок Карпов"]] },
  { slug: "vaskov-kolenets-1559", name: "Васьков", type: "pochinok", records: [["seed", 32, "Починок Васьков"]] }
];

export const up = (db) => {
  let html = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId)?.html;
  if (!html) throw new Error("The 1559 book was not found.");
  for (const card of cards) {
    db.prepare("INSERT INTO places (id,slug,name,name_origin,type_code,status_code) VALUES (?,?,?,'observed',?,'unknown')")
      .run(card.slug, card.slug, card.name, card.type);
    for (const [position, [kind, number, title]] of card.records.entries()) {
      const fragmentId = `${bookId}-${kind}-koshchievsky-${String(number).padStart(3, "0")}`;
      const fragment = db.prepare("SELECT source_heading_id FROM fragments WHERE id=? AND book_id=?").get(fragmentId, bookId);
      if (!fragment || db.prepare("SELECT 1 FROM mentions WHERE fragment_id=?").get(fragmentId)) {
        throw new Error(`Missing or already linked record: ${fragmentId}.`);
      }
      const pattern = new RegExp(`(<h3\\b[^>]*id="${fragment.source_heading_id}"[^>]*>)(${title})(<\\/h3>)`, "u");
      if (!pattern.test(html)) throw new Error(`Unlinked heading not found: ${title}.`);
      html = html.replace(pattern, `$1<a class="place-title-link" href="../../places/${card.slug}/">$2</a>$3`);
      const mentionId = `mention:${fragmentId}`;
      db.prepare("INSERT INTO mentions (id,place_id,fragment_id,source_name,match_reliability) VALUES (?,?,?,?,'exact')")
        .run(mentionId, card.slug, fragmentId, title);
      db.prepare(`INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key,display_label)
        SELECT ?,administrative_unit_id,context_key,display_label FROM mention_administrative_units WHERE mention_id=?`)
        .run(mentionId, modelMention);
      db.prepare(`INSERT INTO fragment_administrative_units (fragment_id,administrative_unit_id,context_key)
        SELECT ?,administrative_unit_id,context_key FROM mention_administrative_units WHERE mention_id=?`)
        .run(fragmentId, modelMention);
      db.prepare(`INSERT INTO mention_land_categories (mention_id,position,code,label,display_period)
        SELECT ?,position,code,label,display_period FROM mention_land_categories WHERE mention_id=?`)
        .run(mentionId, modelMention);
      db.prepare(`INSERT INTO mention_land_category_owners (mention_id,land_category_position,land_owner_id,position)
        SELECT ?,land_category_position,land_owner_id,position FROM mention_land_category_owners WHERE mention_id=?`)
        .run(mentionId, modelMention);
      const name = title.replace(/^(?:Деревня|Починок)\s+/u, "");
      let nameId = db.prepare("SELECT id FROM place_names WHERE place_id=? AND name=?").get(card.slug, name)?.id;
      if (!nameId) {
        nameId = `attested:${mentionId}`;
        db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,?,?,'ru','attested')")
          .run(nameId, card.slug, name);
      }
      db.prepare(`INSERT INTO place_name_states
        (id,place_id,place_name_id,type_code,source_mention_id,observed_year,display_period,assertion_kind,position)
        VALUES (?,?,?,?,?,'1559','1559','observed',?)`)
        .run(`observed:${mentionId}`, card.slug, nameId, card.type, mentionId, position);
    }
  }
  const remaining = db.prepare(`SELECT id FROM fragments f WHERE book_id=?
    AND NOT EXISTS (SELECT 1 FROM mentions m WHERE m.fragment_id=f.id)
    AND json_extract(raw_json,'$.church_source_only') IS NOT 1`).all(bookId);
  if (remaining.length) throw new Error(`Unlinked records remain: ${remaining.map((row) => row.id).join(", ")}.`);
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html, bookId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after creating the 1559 cards.");
};
