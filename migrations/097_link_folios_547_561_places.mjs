const bookId = "belozersky-1626";
const ownerId = "kirillo-belozersky-monastery";
const contextUnits = [
  ["uezd:Белозерский", "uezd"],
  ["stan:Надпорожский", "stan"],
  ["volost:Чуровская", "volost"]
];

const existingPlaceByRecord = new Map([
  [1, ["ilinskaya", "probable"]],
  [11, ["seltsa", "probable"]],
  [17, ["sosnovka", "probable"]],
  [33, ["ovinets", "probable"]],
  [44, ["selishche", "exact"]],
  [52, ["yakulkino", "exact"]],
  [97, ["obukhovo-ugla", "probable"]],
  [103, ["pochinok-kharlamov-u-kolentsa", "probable"]]
]);

const transliteration = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y",
  ь: "", э: "e", ю: "yu", я: "ya"
};

const textFromHtml = (html) => String(html)
  .replace(/<span\b[^>]*class="[^"]*\bpage-mark\b[^"]*"[^>]*>[\s\S]*?<\/span>/giu, "")
  .replace(/<[^>]+>/gu, " ")
  .replaceAll("&nbsp;", " ")
  .replaceAll("&amp;", "&")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&quot;", '"')
  .replace(/\s+/gu, " ")
  .trim();

const extractPlace = (heading) => {
  const sourceName = textFromHtml(heading);
  let typeCode = "village";
  let name = sourceName.replace(/[,.\s]+$/u, "");

  if (/^Пуст(?:ошь|иш)\b/iu.test(name)) {
    typeCode = "pustosh";
    name = name.replace(/^Пуст(?:ошь|иш)\s*/iu, "");
  } else if (/^Починок\b/iu.test(name)) {
    typeCode = "pochinok";
    name = name.replace(/^Починок\s*/iu, "");
  } else if (/^У погоста ж на церковной земле починок\b/iu.test(name)) {
    typeCode = "pochinok";
    name = name.replace(/^У погоста ж на церковной земле починок\s*/iu, "");
  } else if (/^В Коленце на реке на Шексне погост\b/iu.test(name)) {
    typeCode = "pogost";
    name = "Коленец";
  } else if (/^Да к погос\[т\]у ж церковная пустошь\b/iu.test(name)) {
    typeCode = "pustosh";
    name = name.replace(/^Да к погос\[т\]у ж церковная пустошь\s*/iu, "");
  } else if (/^Село\b/iu.test(name)) {
    name = name.replace(/^Село\s*/iu, "").split(/,|\s+на\s+/u)[0];
  } else if (/^Деревня,?\s+что была пустошь\b/iu.test(name)) {
    name = name.replace(/^Деревня,?\s+что была пустошь\s*/iu, "");
  } else if (/^Деревня\b/iu.test(name)) {
    name = name.replace(/^Деревня\s*/iu, "");
  } else if (/^Деревни\b/iu.test(name)) {
    name = name.replace(/^Деревни\s*/iu, "");
  }

  name = name
    .replace(/\s+на\s+(?:речке|реке|суходоле)\b[\s\S]*$/iu, "")
    .replace(/\s+против\b[\s\S]*$/iu, "")
    .replace(/\s+а\s+(?:Белоусово|Репино|Малгиево)\b[\s\S]*$/iu, "")
    .replace(/,\s*[\s\S]*$/u, "")
    .replace(/\s+\(л\.[\s\S]*$/iu, "")
    .replace(/[,.\s]+$/u, "")
    .trim();

  return { sourceName, name, typeCode };
};

const slugify = (value) => value.toLocaleLowerCase("ru-RU")
  .replaceAll("ё", "е")
  .split("").map((character) => transliteration[character] ?? character).join("")
  .replace(/[^a-z0-9]+/gu, "-")
  .replace(/^-+|-+$/gu, "") || "place";

export const up = (db) => {
  const book = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!book) throw new Error("The 1626/27 book document was not found.");

  const html = book.html.replace(/<a class="historical-source-link"[^>]*>↗ 1544<\/a>/gu, "");
  if (html !== book.html) {
    db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
  }

  const units = new Map(db.prepare("SELECT id, kind FROM administrative_units").all().map((unit) => [unit.id, unit]));
  const ownerExists = db.prepare("SELECT 1 FROM land_owners WHERE id = ?").get(ownerId);
  if (!ownerExists) throw new Error(`Land owner ${ownerId} was not found.`);
  for (const [unitId] of contextUnits) if (!units.has(unitId)) throw new Error(`Administrative unit ${unitId} was not found.`);

  db.prepare(`
    UPDATE fragments SET position = position + 10000
    WHERE book_id = ? AND source_heading_id LIKE 'folios-547-561-place-%-heading' AND position >= 96
  `).run(bookId);
  db.prepare(`
    UPDATE fragments SET position = position - 9999
    WHERE book_id = ? AND source_heading_id LIKE 'folios-547-561-place-%-heading' AND position >= 10000
  `).run(bookId);

  const linked = [];
  for (let number = 1; number <= 106; number += 1) {
    if (number === 48) continue; // section label, not a settlement
    const headingId = `folios-547-561-place-${number}-heading`;
    const pattern = new RegExp(`<h[2-6]\\b[^>]*\\bid="${headingId}"[^>]*>([\\s\\S]*?)<\\/h[2-6]>`, "iu");
    const heading = pattern.exec(html)?.[1];
    if (!heading) throw new Error(`Settlement heading ${headingId} was not found.`);
    const parsed = extractPlace(heading);
    if (!parsed.name) throw new Error(`Could not extract the place name from ${headingId}.`);

    const sourceRecord = db.prepare(`
      SELECT fragments.id AS fragment_id, mentions.id AS mention_id,
        mentions.place_id, mentions.match_reliability
      FROM fragments
      LEFT JOIN mentions ON mentions.fragment_id = fragments.id
      WHERE fragments.book_id = ? AND fragments.source_heading_id = ?
    `).get(bookId, headingId);
    const target = existingPlaceByRecord.get(number);
    let placeId;
    let reliability;
    if (target) {
      [placeId, reliability] = target;
      if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) {
        throw new Error(`Existing place ${placeId} was not found.`);
      }
    } else if (sourceRecord?.place_id) {
      placeId = sourceRecord.place_id;
      reliability = sourceRecord.match_reliability;
    } else {
      placeId = `place-1626-folio-547-${number}`;
      const baseSlug = `${slugify(parsed.name)}-1626-${number}`;
      let slug = baseSlug;
      let suffix = 2;
      while (db.prepare("SELECT 1 FROM places WHERE slug = ?").get(slug)) slug = `${baseSlug}-${suffix++}`;
      db.prepare(`
        INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
        VALUES (?, ?, ?, 'observed', ?, 'unknown')
      `).run(placeId, slug, parsed.name, parsed.typeCode);
      reliability = "exact";
    }

    const fragmentId = sourceRecord?.fragment_id ?? `belozersky-1626-fragment-folios-547-561-place-${number}`;
    if (!db.prepare("SELECT 1 FROM fragments WHERE id = ?").get(fragmentId)) {
      db.prepare(`
        INSERT INTO fragments (id, book_id, source_heading_id, folio, position, link_target_id, raw_json)
        VALUES (?, ?, ?, NULL, ?, NULL, '{}')
      `).run(fragmentId, bookId, headingId, 92 + number);
    }

    const mentionId = sourceRecord?.mention_id ?? `belozersky-1626-mention-folios-547-561-place-${number}`;
    if (!sourceRecord?.mention_id) {
      db.prepare(`
        INSERT INTO mentions (id, place_id, fragment_id, source_name, historical_name_override, match_reliability)
        VALUES (?, ?, ?, ?, NULL, ?)
      `).run(mentionId, placeId, fragmentId, parsed.sourceName, reliability);
      for (const [unitId, contextKey] of contextUnits) {
        db.prepare(`
          INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
          VALUES (?, ?, ?)
        `).run(mentionId, unitId, contextKey);
      }
      db.prepare(`
        INSERT INTO mention_land_categories (mention_id, position, code, label, display_period)
        VALUES (?, 0, 'monastery', 'Монастырская', NULL)
      `).run(mentionId);
      db.prepare(`
        INSERT INTO mention_land_category_owners (mention_id, land_category_position, land_owner_id, position)
        VALUES (?, 0, ?, 0)
      `).run(mentionId, ownerId);
    }
    linked.push({ headingId, placeId });
  }

  if (linked.length !== 105) throw new Error(`Expected 105 settlement headings, prepared ${linked.length}.`);
};
