const bookId = "belozersky-1626";

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

const parsePlace = (heading) => {
  let text = textFromHtml(heading).replace(/[,.\s]+$/u, "");
  let typeCode = "village";

  const prefix = (value) => text.startsWith(value);
  if (prefix("В Коленце на реке на Шексне погост")) return { name: "Коленец", typeCode: "pogost" };
  if (prefix("Да к погос[т]у ж церковная пустошь ")) {
    text = text.slice("Да к погос[т]у ж церковная пустошь ".length);
    typeCode = "pustosh";
  } else if (prefix("У погоста ж на церковной земле починок ")) {
    text = text.slice("У погоста ж на церковной земле починок ".length);
    typeCode = "pochinok";
  } else if (prefix("Деревня, что была пустошь ")) {
    text = text.slice("Деревня, что была пустошь ".length);
  } else if (prefix("Деревни ")) {
    text = text.slice("Деревни ".length);
  } else if (prefix("Деревня ")) {
    text = text.slice("Деревня ".length);
  } else if (prefix("Село ")) {
    text = text.slice("Село ".length);
  } else if (prefix("Пустошь ")) {
    text = text.slice("Пустошь ".length);
    typeCode = "pustosh";
  } else if (prefix("Пустиш ")) {
    text = text.slice("Пустиш ".length);
    typeCode = "pustosh";
  } else if (prefix("Починок ")) {
    text = text.slice("Починок ".length);
    typeCode = "pochinok";
  }

  const cuts = [",", " на речке", " на реке", " на ручью", " на суходоле", " против ", " (л."]
    .map((token) => text.indexOf(token))
    .filter((index) => index >= 0);
  if (cuts.length) text = text.slice(0, Math.min(...cuts));

  const bracketedOnly = /^\[([^\]]+)\]$/u.exec(text);
  if (bracketedOnly) text = bracketedOnly[1].replace(/\?$/u, "?");
  else if (text.includes("[Починок]")) text = "Починок";
  else if (text.includes("[Большой]")) text = "Большой Двор";
  else text = text.replace(/\s*\[[^\]]+\]/gu, "");

  return { name: text.replace(/[,.\s]+$/u, "").trim(), typeCode };
};

export const up = (db) => {
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1626/27 book document was not found.");

  const newCards = db.prepare(`
    SELECT places.id, places.slug, mentions.id AS mention_id, fragments.source_heading_id
    FROM places
    JOIN mentions ON mentions.place_id = places.id
    JOIN fragments ON fragments.id = mentions.fragment_id
    WHERE fragments.book_id = ? AND fragments.source_heading_id LIKE 'folios-547-561-place-%-heading'
      AND places.slug LIKE '%-1626-%'
  `).all(bookId);
  const updateCard = db.prepare("UPDATE places SET name = ?, type_code = ? WHERE id = ?");
  for (const card of newCards) {
    const headingId = card.source_heading_id;
    const pattern = new RegExp(`<h[2-6]\\b[^>]*\\bid="${headingId}"[^>]*>([\\s\\S]*?)<\\/h[2-6]>`, "iu");
    const heading = pattern.exec(document.html)?.[1];
    if (!heading) throw new Error(`Heading ${headingId} was not found.`);
    const parsed = parsePlace(heading);
    if (!parsed.name) throw new Error(`Could not normalize the place name for ${headingId}.`);
    updateCard.run(parsed.name, parsed.typeCode, card.id);
  }

  const merges = [
    [3, "knyazhe"],
    [34, "pochinok-ugla"],
    [54, "pochinok-ugla"],
    [70, "modenov"],
    [72, "shevyrino"]
  ];
  for (const [number, targetId] of merges) {
    const mention = db.prepare(`
      SELECT mentions.id, mentions.place_id
      FROM mentions
      JOIN fragments ON fragments.id = mentions.fragment_id
      WHERE fragments.book_id = ? AND fragments.source_heading_id = ?
    `).get(bookId, `folios-547-561-place-${number}-heading`);
    if (!mention) throw new Error(`Folio 547-561 place ${number} was not found.`);
    if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(targetId)) throw new Error(`Target place ${targetId} was not found.`);
    if (mention.place_id === targetId) continue;

    db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'probable' WHERE id = ?")
      .run(targetId, mention.id);
    db.prepare("DELETE FROM places WHERE id = ? AND NOT EXISTS (SELECT 1 FROM mentions WHERE place_id = ?)")
      .run(mention.place_id, mention.place_id);
  }

  // The two occurrences of Pustosh Stepanovskaya are one named holding.
  const first = db.prepare(`
    SELECT mentions.place_id FROM mentions
    JOIN fragments ON fragments.id = mentions.fragment_id
    WHERE fragments.book_id = ? AND fragments.source_heading_id = 'folios-547-561-place-71-heading'
  `).get(bookId);
  const second = db.prepare(`
    SELECT mentions.id, mentions.place_id FROM mentions
    JOIN fragments ON fragments.id = mentions.fragment_id
    WHERE fragments.book_id = ? AND fragments.source_heading_id = 'folios-547-561-place-93-heading'
  `).get(bookId);
  if (first && second && first.place_id !== second.place_id) {
    db.prepare("UPDATE mentions SET place_id = ?, match_reliability = 'probable' WHERE id = ?")
      .run(first.place_id, second.id);
    db.prepare("DELETE FROM places WHERE id = ? AND NOT EXISTS (SELECT 1 FROM mentions WHERE place_id = ?)")
      .run(second.place_id, second.place_id);
  }
};
