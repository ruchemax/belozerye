// Each seed-book record identifies a settlement; rent records refer back to it.
const seedPlaces = [
  "pustosh-mordvinovo-1626-88", "brykino", "lukino", "telyatnik", "vysokoe-ugla",
  "olekseeva", "charoma", "igaya", "fedotov", "tarasova", "shevyrino", "tishinskoe",
  "pustosh-rusanova-1626-105", "pustosh-demino-1626-64", "rameshka-charomsky-1559", "krasnoe",
  "valovka-charomsky-1559", "selivanov", "peshkov", "krushkovo", "krutets", "rodino",
  "pustosh-stupnevo-1626-85", "nazarovo", "timoshin", "pustosh-krutets-lgunin-1626-63",
  "khlopovo-1559", "putilovo-1559", "kotovo", "derevnya-1626-6", "shevnitsyno-1559",
  "zasorikhino-1559", "pustosh-mishkino-1626-62", "kholmy-charomsky-1559", "omosov-1559",
  "troshin-charomsky-1559", "bykov-1559", "denisov-1559", "khalturin-1559", "pustosh-mikitino-1626-100",
  "okoemovo", "myatino-1559", "sintsovskoe", "sosnovets-1559", "golodyaevo", "bezsoloe",
  "pustosh-retino-1626-50", "pustosh-kuchino-1626-96", "skomorokhov-1559", "nifontov-1559",
  "ivantsovo", "kolyshino", "perkhino", "pestovo", "seltsa", "obukhovo-ugla", "durakov", "sofonovo",
  "derevnya-gnevosheva-na-rechke-na-chyurovke-1626-30", "selishche", "larino", "poteryaevo",
  "ostyunino-1559", "pochinok-kharlamov-u-kolentsa", "pishkov-1559", "bovynin", "berezkino-1559",
  "tarasov", "voroshnino", "kurgany", "chyuravskaya-nov", "drozdovo",
  "derevnya-pochinok-na-rechke-na-chyurovke-1626-34", "ovinets",
  "u-pogosta-zh-na-tserkovnoy-zemle-pochinok-kolovin-1626-13"
];
const rentSeedRecords = [
  40,24,23,6,7,33,3,2,1,4,5,29,9,8,32,31,26,34,21,28,17,20,18,22,16,19,15,14,13,12,25,10,11,27,30,
  41,43,44,45,46,42,47,48,54,53,51,52,55,56,59,57,58,60,61,62,63,64
];
// These cross-century identifications depend on name variants, not literal identity.
const probableSeedRecords = new Set([1,3,8,9,10,12,13,18,22,23,26,30,33,40,46,52,60,63,64,66,68,69,74,75]);
const newlyNamed = {
  "rameshka-charomsky-1559": "Рамешка", "valovka-charomsky-1559": "Валовка",
  "khlopovo-1559": "Хлопово", "putilovo-1559": "Путилово", "shevnitsyno-1559": "Шевницыно",
  "zasorikhino-1559": "Засорихино", "kholmy-charomsky-1559": "Холмы", "omosov-1559": "Омосов",
  "troshin-charomsky-1559": "Трошин", "bykov-1559": "Быков", "denisov-1559": "Денисов",
  "khalturin-1559": "Халтурин", "myatino-1559": "Мятино", "sosnovets-1559": "Сосновец",
  "skomorokhov-1559": "Скоморохов", "nifontov-1559": "Нифонтов", "ostyunino-1559": "Остюнино",
  "pishkov-1559": "Пишков", "berezkino-1559": "Березкино"
};
const text = (html) => html.replace(/<[^>]+>/gu, "").replace(/\s+/gu, " ").trim();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

export const up = (db) => {
  const bookId = "kirillov-1559";
  let html = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId)?.html;
  if (!html || seedPlaces.length !== 75 || rentSeedRecords.length !== 57) throw new Error("Invalid 1559 source inventory.");
  const fragments = db.prepare("SELECT * FROM fragments WHERE book_id = ? ORDER BY position").all(bookId);
  if (fragments.length !== 132) throw new Error("Expected 132 unlinked source fragments.");
  const addPlace = db.prepare("INSERT INTO places (id, slug, name, name_origin, type_code, status_code) VALUES (?, ?, ?, 'observed', ?, 'unknown')");
  for (const [id, name] of Object.entries(newlyNamed)) {
    const seed = seedPlaces.indexOf(id) + 1;
    const type = [35,36,37,38,39,49,50,65].includes(seed) ? "pochinok" : "village";
    addPlace.run(id, id, name, type);
  }
  const getUnit = (name, kind) => {
    const found = db.prepare("SELECT id FROM administrative_units WHERE name = ? AND kind = ?").get(name, kind);
    if (found) return found.id;
    const id = `${kind}:${name}`;
    db.prepare("INSERT INTO administrative_units (id, kind, name) VALUES (?, ?, ?)").run(id, kind, name);
    return id;
  };
  const uezd = getUnit("Белозерский", "uezd");
  const charoma = getUnit("Чаромский ключ", "subdivision");
  const chyurava = getUnit("Чюравский ключ", "subdivision");
  const sudbitsy = getUnit("Судбицы", "subdivision");
  const zapogostye = getUnit("Запогостье", "subdivision");
  const addMention = db.prepare("INSERT INTO mentions (id, place_id, fragment_id, source_name, match_reliability) VALUES (?, ?, ?, ?, ?)");
  const addUnit = db.prepare("INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key) VALUES (?, ?, ?)");
  const addName = db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, ?, 'ru', 'attested')");
  const addState = db.prepare(`INSERT INTO place_name_states
    (id, place_id, place_name_id, type_code, source_mention_id, observed_year, display_period, assertion_kind, position)
    VALUES (?, ?, ?, ?, ?, '1559', '1559', 'observed', ?)`);
  const addCategory = db.prepare("INSERT INTO mention_land_categories (mention_id, position, code, label) VALUES (?, 0, 'monastery', 'Монастырская')");
  const addOwner = db.prepare(`INSERT INTO mention_land_category_owners
    (mention_id, land_category_position, land_owner_id, position) VALUES (?, 0, 'kirillo-belozersky-monastery', 0)`);
  const attach = (fragment, placeId, sourceName, names, type, key, reliability, extraUnits = []) => {
    if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) throw new Error(`Unknown settlement ${placeId}.`);
    const mentionId = fragment.id.replace("fragment", "mention");
    addMention.run(mentionId, placeId, fragment.id, sourceName, reliability);
    addUnit.run(mentionId, uezd, "uezd");
    addUnit.run(mentionId, key, "subdivision");
    for (const unit of extraUnits) addUnit.run(mentionId, unit, "subdivision");
    addCategory.run(mentionId);
    addOwner.run(mentionId);
    let position = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS n FROM place_name_states WHERE place_id = ?").get(placeId).n;
    for (const [index, name] of [...new Set(names)].entries()) {
      let nameId = db.prepare("SELECT id FROM place_names WHERE place_id = ? AND name = ?").get(placeId, name)?.id;
      if (!nameId) {
        nameId = `attested:${mentionId}:${index}`;
        addName.run(nameId, placeId, name);
      }
      addState.run(`observed:${mentionId}:${index}`, placeId, nameId, type, mentionId, position++);
    }
  };
  for (const [index, fragment] of fragments.entries()) {
    const number = index + 1;
    const seed = number <= 75 ? number : rentSeedRecords[number - 76];
    const placeId = seedPlaces[seed - 1];
    const headingPattern = new RegExp(`(<h3\\b[^>]*id="${escapeRegex(fragment.source_heading_id)}"[^>]*>)([\\s\\S]*?)(<\\/h3>)`, "u");
    const heading = headingPattern.exec(html);
    if (!heading) throw new Error(`Missing source heading ${fragment.source_heading_id}.`);
    const sourceTitle = text(heading[2].replace(/<span class="page-mark">[\s\S]*?<\/span>/gu, "")
      .replace(/\s*\(в рукописи[\s\S]*?\)/u, ""));
    const type = /^(?:Поч\.|Починок)\s/u.test(sourceTitle) ? "pochinok" : "village";
    const prefix = type === "pochinok" ? "Починок" : "Деревня";
    const nameText = sourceTitle.replace(/^(?:Дер\.|Поч\.|Деревня|Починок)\s*/u, "");
    const names = [nameText.replace(/\s*\[[^\]]+\]/gu, "").trim(),
      ...[...nameText.matchAll(/\[([^\]]+)\]/gu)].map(match => match[1])];
    const sourceName = `${prefix} ${nameText}`;
    const key = seed <= 40 ? charoma : chyurava;
    const extra = [];
    if (number >= 58 && number <= 75) extra.push(zapogostye);
    if (number >= 128 && number <= 130) extra.push(sudbitsy);
    const reliability = newlyNamed[placeId] || !probableSeedRecords.has(seed) ? "exact" : "probable";
    attach(fragment, placeId, sourceName, names, type, key, reliability, extra);
    const raw = { ...JSON.parse(fragment.raw_json), source_name_override: sourceName };
    const folio = [...html.slice(0, heading.index).matchAll(/<span class="page-mark">\(л\. ([^)]+)\)<\/span>/gu)].at(-1)?.[1] ?? fragment.folio;
    db.prepare("UPDATE fragments SET raw_json = ?, folio = ? WHERE id = ?").run(JSON.stringify(raw), folio, fragment.id);
    const href = db.prepare("SELECT slug FROM places WHERE id = ?").get(placeId).slug;
    html = html.replace(headingPattern, (_match, opening, label, closing) =>
      `${opening}<a class="place-title-link" href="../../places/${href}/">${label}</a>${closing}`);
  }
  // The marginal addition is an existing source passage with its own settlement card.
  const additionId = "kirillov-1559-fragment-skorobagatoe";
  const headingId = `${additionId}-heading`;
  const note = /(?:Дер\.|Деревня) Скоробагатое( полвыти\. Рядчики положили оброку лета 7070-го ново 3 осмины ржи, 3 чети овса, осмина ячменя\.)/u;
  if (!note.test(html)) throw new Error("The Skorobagatoe marginal addition was not found.");
  html = html.replace(note, (_match, body) => `<a class="place-title-link" id="${headingId}" href="../../places/skorobogatoy/">Дер. Скоробагатое</a><span class="skorobagatoe-addition" id="${additionId}">${body}</span>`);
  db.prepare(`INSERT INTO fragments (id, book_id, source_heading_id, folio, position, raw_json)
    VALUES (?, ?, ?, '249', 133, ?)`).run(additionId, bookId, headingId,
    JSON.stringify({ content_class: "skorobagatoe-addition", source_name_override: "Деревня Скоробагатое" }));
  attach({ id: additionId }, "skorobogatoy", "Деревня Скоробагатое", ["Скоробагатое"], "village", charoma, "probable");
  const book = db.prepare("SELECT raw_json FROM books WHERE id = ?").get(bookId);
  db.prepare("UPDATE books SET raw_json = ? WHERE id = ?").run(JSON.stringify({ ...JSON.parse(book.raw_json), manage_place_links: false }), bookId);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid settlement references after linking the 1559 book.");
};
