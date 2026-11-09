export const up = (db) => {
  const bookId = "belozersky-1626";
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!row) throw new Error("The 1626/27 book document was not found.");

  const links = [
    {
      headingId: "krushkova",
      marker: "</h3><div class=\"village-lines\"",
      sourceAnchor: "place-1-4",
      label: "Крушковой"
    },
    {
      headingId: "land-record-72",
      marker: "</h3><p",
      sourceAnchor: "place-12-1",
      label: "Лошакова"
    }
  ];

  let html = row.html;
  for (const { headingId, marker, sourceAnchor, label } of links) {
    const headingStart = html.indexOf(`id=\"${headingId}\"`);
    if (headingStart < 0) throw new Error(`Heading ${headingId} was not found in the 1626/27 book.`);
    const markerIndex = html.indexOf(marker, headingStart);
    if (markerIndex < 0) throw new Error(`The end of heading ${headingId} was not found.`);
    const anchor = `<a class=\"historical-source-link\" href=\"../../books/belozersky_uezd-1544/#${sourceAnchor}\" aria-label=\"Сопоставление: упоминание ${label} в книге 1544 года\">↗ 1544</a>`;
    if (html.slice(Math.max(0, markerIndex - 260), markerIndex).includes("historical-source-link")) continue;
    html = `${html.slice(0, markerIndex)}</h3>${anchor}${html.slice(markerIndex + 5)}`;
  }

  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
