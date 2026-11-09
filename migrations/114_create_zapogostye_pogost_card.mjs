export const up = (db) => {
  const bookId = "belozersky-1626";
  const placeId = "zapogostye";
  const headingId = "belozersky-1626-fragment-zapogost-churches";
  const fragmentId = "belozersky-1626-fragment-zapogost";
  const mentionId = "belozersky-1626-mention-zapogost";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1626/27 book document was not found.");
  const pattern = new RegExp(`<h4\\b[^>]*\\bid="${headingId}"[^>]*>([\\s\\S]*?)<\\/h4>(<p\\b[^>]*>[\\s\\S]*?<\\/p>)`, "u");
  const source = pattern.exec(document.html);
  if (!source) throw new Error("The Zapogostye pogost passage was not found.");
  const title = source[1].replace(/,\s*$/u, "");
  let html = document.html.replace(pattern,
    `</div></section><section id="folios-547-561-zapogost" class="village-record place-record" data-astro-cid-zcak6nys><h3 id="${headingId}" class="place-heading" data-astro-cid-zcak6nys><span data-astro-cid-zcak6nys>${title}</span><span class="heading-comma" data-astro-cid-zcak6nys>,</span></h3><div class="village-lines" data-astro-cid-zcak6nys>${source[2]}`);
  const nextContents = /<div\b[^>]*\bdata-contents-key="folios-547-561-place-13-heading"[^>]*>/u;
  if (!nextContents.test(html)) throw new Error("The contents entry after the pogost was not found.");
  html = html.replace(nextContents, (entry) =>
    `<div class="contents-entry contents-level-3" data-contents-entry data-contents-level="3" data-contents-key="${headingId}" data-astro-cid-zcak6nys><a href="#${headingId}" class="contents-link" data-astro-cid-zcak6nys>Погост в Запогостье на речке на Чюровке</a></div>${entry}`);

  db.prepare(`INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
    VALUES (?, ?, 'Запогостье', 'observed', 'pogost', 'unknown')`).run(placeId, placeId);
  const church = db.prepare("SELECT longitude, latitude FROM church_geometries WHERE church_id = 'rozhdestva-bogoroditsy-churovskaya-1544'").get();
  if (!church) throw new Error("The Nativity of the Virgin church coordinates were not found.");
  const phi = church.latitude * Math.PI / 180;
  const eccentricitySquared = 6.6943799901413165e-3;
  const meridianRadius = 6378137 * (1 - eccentricitySquared)
    / (1 - eccentricitySquared * Math.sin(phi) ** 2) ** 1.5;
  db.prepare("INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)")
    .run(placeId, church.longitude, church.latitude - 50 / meridianRadius * 180 / Math.PI);

  const next = db.prepare("SELECT position FROM fragments WHERE id = 'belozersky-1626-fragment-folios-547-561-place-13'").get();
  if (!next) throw new Error("The next source fragment was not found.");
  const offset = db.prepare("SELECT MAX(position) + 1000 AS value FROM fragments WHERE book_id = ?").get(bookId).value;
  db.prepare("UPDATE fragments SET position = position + ? WHERE book_id = ? AND position >= ?").run(offset, bookId, next.position);
  db.prepare("UPDATE fragments SET position = position - ? + 1 WHERE book_id = ? AND position >= ?").run(offset, bookId, next.position + offset);
  db.prepare(`INSERT INTO fragments (id, book_id, source_heading_id, folio, position, link_target_id, raw_json)
    VALUES (?, ?, ?, '550об.', ?, NULL, '{}')`).run(fragmentId, bookId, headingId, next.position);
  db.prepare(`INSERT INTO mentions (id, place_id, fragment_id, source_name, historical_name_override, match_reliability)
    VALUES (?, ?, ?, 'В Запогосте ж на речке на Чюровке погост', 'погост Запогостье', 'exact')`)
    .run(mentionId, placeId, fragmentId);
  for (const [unitId, key] of [
    ['uezd:Белозерский', 'uezd'], ['stan:Надпорожский', 'stan'],
    ['volost:Чуровская', 'volost'], ['subdivision:Запогостье', 'subdivision']
  ]) {
    db.prepare("INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key) VALUES (?, ?, ?)")
      .run(mentionId, unitId, key);
  }
  db.prepare(`INSERT INTO mention_land_categories (mention_id, position, code, label, display_period)
    VALUES (?, 0, 'monastery', 'Монастырская', NULL)`).run(mentionId);
  db.prepare(`INSERT INTO mention_land_category_owners (mention_id, land_category_position, land_owner_id, position)
    VALUES (?, 0, 'kirillo-belozersky-monastery', 0)`).run(mentionId);
  const nameId = "attested:zapogostye:1626";
  db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, 'Запогостье', 'ru', 'attested')")
    .run(nameId, placeId);
  db.prepare(`INSERT INTO place_name_states
    (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
    VALUES (?, ?, ?, 'pogost', ?, '1626/27', '1626/27', 'observed', 0)`)
    .run(`observed:${mentionId}`, placeId, nameId, mentionId);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE id IN ('rozhdestva-bogoroditsy-churovskaya-1544', 'rozhdestva-khristova-zapogost')")
    .run(placeId);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
