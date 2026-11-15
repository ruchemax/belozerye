const fragmentId = "kirillov-1601-fragment-potka";
const headingId = `${fragmentId}-heading`;

export const formatDocument = (html) => {
  // Select the complete existing paragraph without changing its transcription.
  const match = [...html.matchAll(/<p class="record-prose">[\s\S]*?<\/p>/gu)]
    .find((entry) => entry[0].includes("Да у них же емлют с пустоши с Потки"));
  if (!match) throw new Error("The Potka rent paragraph was not found.");
  const sentence = /Да у них же емлют с пустоши с Потки[\s\S]*?оброку 5 алтын\./u;
  const body = match[0].replace(/^<p class="record-prose">|<\/p>$/gu, "").replace(sentence, (text) =>
    `<div class="potka-source" id="${fragmentId}">${text.replace("пустоши с Потки", `<h4 class="potka-title" id="${headingId}"><a class="place-title-link" href="../../places/zaopoche/">пустоши с Потки</a></h4>`)}</div>`);
  if (!body.includes(`id="${headingId}"`)) throw new Error("The Potka rent sentence was not found.");
  const style = `<style id="potka-source-style">
.document-body .potka-rent-summary { margin-block: .5rem 0 !important; }
.document-body .potka-source, .document-body .potka-title { display: inline; }
.document-body .potka-title { margin: 0 !important; padding: 0 !important; font: inherit !important; color: inherit !important; }
</style>`;
  return html.replace(match[0], `<section class="record place-record potka-rent-summary" id="kirillov-1601-rent-summary">${body}</section>`)
    .replace("</head>", `${style}</head>`);
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const mentionId = "kirillov-1601-mention-potka";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document || !db.prepare("SELECT 1 FROM places WHERE id='zaopoche'").get()) throw new Error("The Potka source or Pochka card was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(formatDocument(document.html),bookId);
  const position = db.prepare("SELECT MAX(position)+1 AS n FROM fragments WHERE book_id=?").get(bookId).n;
  db.prepare("INSERT INTO fragments (id,book_id,source_heading_id,folio,position,raw_json) VALUES (?,?,?,'41об.',?,?)")
    .run(fragmentId,bookId,headingId,position,JSON.stringify({content_class:"potka-source",hide_source_heading:true,source_name_override:"пустоши с Потки"}));
  db.prepare(`INSERT INTO mentions (id,place_id,fragment_id,source_name,historical_name_override,match_reliability)
    VALUES (?,'zaopoche',?,'пустоши с Потки','Пустошь Потка','exact')`).run(mentionId,fragmentId);
  const modelMention = "kirillov-1601-mention-050-pustosh-agarevo-1626-101";
  db.prepare(`INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key,display_label)
    SELECT ?,administrative_unit_id,context_key,display_label FROM mention_administrative_units WHERE mention_id=?`).run(mentionId,modelMention);
  db.prepare(`INSERT INTO mention_land_categories (mention_id,position,code,label,display_period)
    SELECT ?,position,code,label,display_period FROM mention_land_categories WHERE mention_id=?`).run(mentionId,modelMention);
  db.prepare(`INSERT INTO mention_land_category_owners (mention_id,land_category_position,land_owner_id,position)
    SELECT ?,land_category_position,land_owner_id,position FROM mention_land_category_owners WHERE mention_id=?`).run(mentionId,modelMention);
  const nameId = "attested:potka-1601";
  db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,'zaopoche','Потка','ru','attested')").run(nameId);
  const namePosition = db.prepare("SELECT MAX(position)+1 AS n FROM place_name_states WHERE place_id='zaopoche'").get().n;
  db.prepare(`INSERT INTO place_name_states
    (id,place_id,place_name_id,type_code,source_mention_id,observed_year,display_period,assertion_kind,position)
    VALUES (?,'zaopoche',?,'pustosh',?,'1601','1601','observed',?)`).run(`observed:${mentionId}`,nameId,mentionId,namePosition);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after linking Potka.");
};
