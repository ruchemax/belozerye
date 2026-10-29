const placeId = "ievlevo";
const fragmentId = "belozersky-1585-church-ievlevo";
const mentionId = "mention-belozersky-1585-church-ievlevo";
const placeNameId = "attested:ievlevo";

export const up = (db) => {
  const book = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get("belozersky-1585");
  if (!book) throw new Error("Не найден текст писцовой книги 1585 года.");

  const sectionPattern = /<section\b[^>]*\bid="belozersky-1585-church-ievlevo"[^>]*>\s*<p\b[^>]*\bclass="[^"]*\bchurch-record-inline\b[^"]*"[^>]*\bid="church-ievlevo"[^>]*>\s*<span\b[^>]*\bclass="[^"]*\bchurch-place-heading\b[^"]*"[^>]*>([\s\S]*?)<\/span>,\s*([\s\S]*?)<\/p>\s*<\/section>/u;
  const match = sectionPattern.exec(book.html);
  if (!match) throw new Error("Не найдена запись церковной деревни Иевлево.");

  const section = `<section class="land-record place-record" data-astro-cid-zcak6nys="" id="${fragmentId}"><h3 class="place-heading church-place-heading" data-astro-cid-zcak6nys="" id="church-ievlevo">${match[1]}</h3><p class="church-record-inline" data-astro-cid-zcak6nys="">${match[2]}</p></section>`;
  const spacingStyle = `<style id="ievlevo-paragraph-spacing">
.document-body > section#${fragmentId} {
  margin-bottom: 1.25rem !important;
}
</style>`;
  let html = book.html.replace(sectionPattern, section);
  if (!html.includes('id="ievlevo-paragraph-spacing"')) {
    html = html.replace("</head>", `${spacingStyle}</head>`);
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, "belozersky-1585");

  db.prepare(`
    INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(placeId, "ievlevo", "Иевлево", "observed", "village", "unknown");

  db.prepare(`
    INSERT INTO place_names (id, place_id, name, language, name_kind)
    VALUES (?, ?, ?, 'ru', 'attested')
  `).run(placeNameId, placeId, "Иевлево");

  db.prepare(`
    INSERT INTO fragments (id, book_id, source_heading_id, folio, position, link_target_id, raw_json)
    VALUES (?, ?, ?, ?, ?, NULL, ?)
  `).run(fragmentId, "belozersky-1585", "church-ievlevo", "1548об.", 50, "{}");

  db.prepare(`
    INSERT INTO mentions (id, place_id, fragment_id, source_name, historical_name_override)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    mentionId,
    placeId,
    fragmentId,
    "Да тое ж Чюровские волости церковная деревня Иевлево пуста",
    "Иевлево"
  );

  const addContext = db.prepare(`
    INSERT INTO mention_administrative_units
      (mention_id, administrative_unit_id, context_key)
    VALUES (?, ?, ?)
  `);
  addContext.run(mentionId, "uezd:Белозерский", "uezd");
  addContext.run(mentionId, "prikaz:Усть-Угольский", "prikaz");
  addContext.run(mentionId, "volost:Чуровская", "volost");

  db.prepare(`
    INSERT INTO mention_land_categories
      (mention_id, position, code, label, display_period)
    VALUES (?, 0, 'church', 'Церковная', NULL)
  `).run(mentionId);

  db.prepare(`
    INSERT INTO place_name_states
      (id, place_id, place_name_id, type_code, source_mention_id,
       observed_year, display_period, assertion_kind, position)
    VALUES (?, ?, ?, 'village', ?, '1585', '1585', 'observed', 0)
  `).run(`observed:${mentionId}`, placeId, placeNameId, mentionId);

  const violations = db.prepare("PRAGMA foreign_key_check").all();
  if (violations.length) throw new Error("Нарушены внешние ключи после добавления Иевлева.");
};
