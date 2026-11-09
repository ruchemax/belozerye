export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1626/27 book document was not found.");
  let html = document.html;
  const newChurches = [
    ["andreya-pervozvannogo-charoma", "Церковь Ондрея Первозванного", "charoma"],
    ["rozhdestva-khristova-zapogost", "Церковь Рождества Христова", null]
  ];
  for (const [id, name, location] of newChurches) {
    db.prepare("INSERT INTO churches (id, slug, name, location_place_id) VALUES (?, ?, ?, ?)")
      .run(id, id, name, location);
  }

  const links = [
    ["церковь Святаго Пророка Ильи", "ili-proroka-charoma"],
    ["церковь Святаго Апостола Ондрея Первозванного", "andreya-pervozvannogo-charoma"],
    ["церков[ь] Рожество Пречистые Богородицы", "rozhdestva-bogoroditsy-churovskaya-1544"],
    ["церковь Рожество Христово", "rozhdestva-khristova-zapogost"],
    ["церковь Преподобны Кирил Чюдотворец", "kirilla-belozerskogo-pishchalinskoe"]
  ];
  for (const [text, slug] of links) {
    if (!html.includes(text)) throw new Error(`Church text was not found: ${text}`);
    html = html.replace(text, `<a href="../../churches/${slug}/">${text}</a>`);
  }

  const zapogostFragment = "belozersky-1626-fragment-zapogost-churches";
  const heading = '<h4 class="place-heading" data-astro-cid-zcak6nys>В Запогосте ж';
  if (!html.includes(heading)) throw new Error("The Zapogost churchyard heading was not found.");
  html = html.replace(heading, `<h4 id="${zapogostFragment}" class="place-heading" data-astro-cid-zcak6nys>В Запогосте ж`);
  const position = db.prepare("SELECT MAX(position) + 1 AS position FROM fragments WHERE book_id = ?").get(bookId).position;
  db.prepare(`
    INSERT INTO fragments (id, book_id, source_heading_id, folio, position, link_target_id, raw_json)
    VALUES (?, ?, ?, '550об.', ?, NULL, '{"church_source_only":true}')
  `).run(zapogostFragment, bookId, zapogostFragment, position);

  db.prepare("DELETE FROM church_sources WHERE church_id = ? AND fragment_id = ?")
    .run("rozhdestva-bogoroditsy-churovskaya-1544", "belozersky-1626-fragment-folios-547-561-place-12");
  const sources = [
    ["ili-proroka-charoma", "belozersky-1626-fragment-folios-547-561-place-1-church-source"],
    ["andreya-pervozvannogo-charoma", "belozersky-1626-fragment-folios-547-561-place-1-church-source"],
    ["rozhdestva-bogoroditsy-churovskaya-1544", zapogostFragment],
    ["rozhdestva-khristova-zapogost", zapogostFragment],
    ["kirilla-belozerskogo-pishchalinskoe", "belozersky-1626-fragment-folios-547-561-place-18"]
  ];
  for (const [churchId, fragmentId] of sources) {
    db.prepare("INSERT OR IGNORE INTO church_sources (church_id, fragment_id) VALUES (?, ?)").run(churchId, fragmentId);
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
