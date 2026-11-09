export const up = (db) => {
  const bookId = "belozersky-1626";
  const headingId = "folios-547-561-group-4";
  const endId = "folios-547-561-place-39-heading";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1626 book document was not found.");

  const heading = new RegExp(`<h2\\b[^>]*\\bid="${headingId}"[^>]*>`, "u");
  const entry = new RegExp(`<div\\b[^>]*\\bdata-contents-key="${headingId}"[^>]*>`, "u");
  const bodyBoundary = "const boundary = headings.slice(headingIndex + 1).find((candidate) => Number(candidate.tagName.slice(1)) <= level);";
  const contentsBoundary = "Number(nextEntry.dataset.contentsLevel) <= level";
  if (!heading.test(document.html) || !entry.test(document.html)
    || !document.html.includes(bodyBoundary) || !document.html.includes(contentsBoundary)) {
    throw new Error("The Churovka group or its collapse handlers were not found.");
  }
  const html = document.html
    .replace(heading, (tag) => tag.replace(/>$/u, ` data-section-end="${endId}">`))
    .replace(entry, (tag) => tag.replace(/>$/u, ` data-contents-end="${endId}">`))
    .replace(bodyBoundary, 'const boundary = document.getElementById(heading.dataset.sectionEnd ?? "") ?? headings.slice(headingIndex + 1).find((candidate) => Number(candidate.tagName.slice(1)) <= level);')
    .replace(contentsBoundary, `${contentsBoundary} || nextEntry.dataset.contentsKey === entry.dataset.contentsEnd`);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);

  const unitId = "subdivision:Запогостье";
  const insert = db.prepare(`
    INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key, display_label)
    VALUES (?, ?, 'subdivision', 'тянут к Запогостью')
    ON CONFLICT(mention_id, context_key, administrative_unit_id)
    DO UPDATE SET display_label = excluded.display_label
  `);
  for (const number of [36, 37, 38]) {
    const mentionId = `belozersky-1626-mention-folios-547-561-place-${number}`;
    if (!db.prepare("SELECT 1 FROM mentions WHERE id = ?").get(mentionId)) {
      throw new Error(`The Churovka village mention ${mentionId} was not found.`);
    }
    insert.run(mentionId, unitId);
  }
};
