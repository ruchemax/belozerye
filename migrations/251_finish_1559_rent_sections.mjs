export const formatDocument = (html) => {
  let result = html;
  for (const [headingId, targetId, boundary] of [
    ["rent-charoma-title", "body-rent-charoma-section", '<h1 id="rent-chyurava-title"'],
    ["rent-chyurava-title", "body-rent-chyurava-section", '</div></div><div aria-hidden="true" class="paper-bottom-edge"']
  ]) {
    if (result.includes(`id="${targetId}"`)) continue;
    const start = result.indexOf(`<h1 id="${headingId}"`);
    const headingEnd = result.indexOf("</h1>", start) + 5;
    const end = result.indexOf(boundary, headingEnd);
    if (start < 0 || headingEnd < 5 || end < 0) throw new Error(`Missing rent section ${headingId}.`);
    const heading = result.slice(start, headingEnd).replace(/(<h1\b[^>]*>)/u,
      `$1<button class="heading-toggle" type="button" data-body-toggle aria-controls="${targetId}" aria-expanded="true" aria-label="Свернуть раздел"><span class="heading-toggle-icon" aria-hidden="true">▾</span></button>`);
    result = result.slice(0, start) + heading + `<div class="group-content" id="${targetId}">`
      + result.slice(headingEnd, end) + "</div>\n" + result.slice(end);
  }
  result = result.replace(/ <span class="source-note">\[Дополнено на нижнем поле другим почерком: Лета 7070-го прикладывали оброку рядчики старцы [\s\S]*?на деревни на Ступное четь ржи, 2 чети овса\.\]<\/span>/u, "");
  return result;
};

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
