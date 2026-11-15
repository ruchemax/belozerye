export const formatHeadings = (html) => {
  let count = 0;
  const result = html.replace(
    /<h2 id="([^"]+)" class="section-heading">([^<]+)<\/h2>((?:\s*<section class="record place-record"[\s\S]*?<\/section>)+)/gu,
    (_, id, title, records) => {
      count++;
      const toggle = `<button class="heading-toggle" type="button" data-body-toggle aria-controls="body-${id}" aria-expanded="true" aria-label="Свернуть раздел"><span class="heading-toggle-icon" aria-hidden="true">▾</span></button>`;
      return `<h2 id="${id}" class="group-heading">${toggle}${title}</h2><div class="group-content" id="body-${id}">${records}</div>`;
    }
  );
  const formattedCount = [...result.matchAll(/<h2 id="[^"]+" class="group-heading"><button/gu)].length;
  if ((count !== 0 && count !== 5) || formattedCount !== 5) {
    throw new Error("Expected five secondary headings in the 1601 book.");
  }
  return result;
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(formatHeadings(document.html), bookId);
};
