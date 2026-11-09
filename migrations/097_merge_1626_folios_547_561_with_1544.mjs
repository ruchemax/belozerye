const matches = [
  [5, "tarasova", "exact"],
  [8, "perkhino", "exact"],
  [10, "pestovo", "exact"],
  [12, "sofonovo", "probable"],
  [14, "drozdovo", "probable"],
  [15, "kurgany", "probable"],
  [16, "golodyaevo", "exact"],
  [20, "sokolovo", "exact"],
  [21, "maltsov", "probable"],
  [23, "romanovskoe", "exact"],
  [26, "nazarovo", "exact"],
  [27, "rodino", "exact"],
  [28, "igaya", "exact"],
  [29, "kolyshino", "probable"],
  [32, "durakov", "probable"],
  [35, "chyuravskaya-nov", "probable"],
  [36, "okoemovo", "exact"],
  [37, "sintsovskoe", "probable"],
  [38, "oksenovo", "exact"],
  [41, "ramene", "probable"],
  [42, "fedotov", "probable"],
  [43, "bronnikovo", "exact"],
  [45, "larino", "probable"],
  [55, "koshcheevo", "exact"],
  [56, "brykino", "exact"],
  [59, "krutets", "exact"],
  [68, "telyatnik", "exact"],
  [86, "peshkov", "probable"],
  [87, "krasnoe", "probable"],
  [89, "kuleberovo", "exact"],
  [94, "kurakin", "probable"],
  [97, "obukhovo-ugla", "exact"],
  [103, "pochinok-kharlamov-u-kolentsa", "exact"]
];

const fragmentIdFor = (number) => `belozersky-1626-fragment-folios-547-561-place-${number}`;
const sectionIdFor = (number) => `folios-547-561-place-${number}`;
const headingIdFor = (number) => `${sectionIdFor(number)}-heading`;

export const up = (db) => {
  const bookId = "belozersky-1626";
  const book = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!book) throw new Error("The 1626/27 book document was not found.");

  const maxPosition = db.prepare("SELECT COALESCE(MAX(position), 0) AS value FROM fragments WHERE book_id = ?").get(bookId).value;
  const insertFragment = db.prepare(`
    INSERT OR IGNORE INTO fragments(id, book_id, source_heading_id, position, raw_json)
    VALUES (?, ?, ?, ?, '{}')
  `);
  const insertMention = db.prepare(`
    INSERT OR IGNORE INTO mentions(id, place_id, fragment_id, source_name, match_reliability)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertAdministrativeUnit = db.prepare(`
    INSERT OR IGNORE INTO mention_administrative_units(mention_id, administrative_unit_id, context_key)
    VALUES (?, ?, ?)
  `);
  const insertLandCategory = db.prepare(`
    INSERT OR IGNORE INTO mention_land_categories(mention_id, position, code, label, display_period)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertLandOwner = db.prepare(`
    INSERT OR IGNORE INTO mention_land_category_owners(mention_id, land_category_position, land_owner_id, position)
    VALUES (?, ?, ?, ?)
  `);
  const insertChurchSource = db.prepare("INSERT OR IGNORE INTO church_sources(church_id, fragment_id) VALUES (?, ?)");

  const contexts = db.prepare(`
    SELECT administrative_unit_id, context_key
    FROM mention_administrative_units
    WHERE mention_id = 'mention-belozersky-1626-church-and-estates'
  `).all();
  const categories = db.prepare(`
    SELECT position, code, label, display_period
    FROM mention_land_categories
    WHERE mention_id = 'mention-belozersky-1544-place-1-1'
  `).all();
  const owners = db.prepare(`
    SELECT land_category_position, land_owner_id, position
    FROM mention_land_category_owners
    WHERE mention_id = 'mention-belozersky-1544-place-1-1'
  `).all();
  if (!contexts.some(({ context_key }) => context_key === "uezd") || !categories.length) {
    throw new Error("Reference administrative context or monastery land category is missing.");
  }

  const sourceNameFor = (number) => {
    const id = headingIdFor(number).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`<h[1-6]\\b[^>]*\\bid="${id}"[^>]*>([\\s\\S]*?)<\\/h[1-6]>`, "u");
    const match = pattern.exec(book.html);
    if (!match) throw new Error(`Heading ${headingIdFor(number)} was not found.`);
    return match[1]
      .replace(/<span\b[^>]*class="[^"]*\bpage-mark\b[^"]*"[^>]*>[\s\S]*?<\/span>/giu, "")
      .replace(/<[^>]*>/gu, " ")
      .replace(/&nbsp;|&#160;/giu, " ")
      .replace(/&amp;/giu, "&")
      .replace(/\s+/gu, " ")
      .trim()
      .replace(/[,.]$/u, "")
      .trim();
  };

  for (const [number, placeId, reliability] of matches) {
    const fragmentId = fragmentIdFor(number);
    const mentionId = `belozersky-1626-mention-folios-547-561-place-${number}`;
    insertFragment.run(fragmentId, bookId, headingIdFor(number), maxPosition + number);
    insertMention.run(mentionId, placeId, fragmentId, sourceNameFor(number), reliability);
    for (const { administrative_unit_id, context_key } of contexts) {
      insertAdministrativeUnit.run(mentionId, administrative_unit_id, context_key);
    }
    for (const { position, code, label, display_period } of categories) {
      insertLandCategory.run(mentionId, position, code, label, display_period);
    }
    for (const { land_category_position, land_owner_id, position } of owners) {
      insertLandOwner.run(mentionId, land_category_position, land_owner_id, position);
    }
  }

  const churchSourceFragmentId = `${fragmentIdFor(1)}-church-source`;
  db.prepare(`
    INSERT OR IGNORE INTO fragments(id, book_id, source_heading_id, position, raw_json)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    churchSourceFragmentId,
    bookId,
    sectionIdFor(1),
    maxPosition + 1,
    JSON.stringify({ church_source_only: true, content_class: "village-lines" })
  );
  db.prepare("UPDATE fragments SET source_heading_id = ?, raw_json = ? WHERE id = ?").run(
    sectionIdFor(1),
    JSON.stringify({ church_source_only: true, content_class: "village-lines" }),
    churchSourceFragmentId
  );
  insertChurchSource.run("ili-proroka-charoma", churchSourceFragmentId);
  insertChurchSource.run("rozhdestva-bogoroditsy-churovskaya-1544", fragmentIdFor(12));
};
