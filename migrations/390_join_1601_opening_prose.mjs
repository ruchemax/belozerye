export const joinOpeningProse = (html) => {
  const opening = 'в Чяромских</h1>\n<div class="group-content" id="body-sizma-estate">\n<p class="record-prose">Божие милосердие';
  const replacement = 'в Чяромских,</h1>\n<div class="group-content" id="body-sizma-estate">\n<p class="record-prose census-opening-prose">божие милосердие';
  if (html.includes('id="census-opening-style"')) return html;
  if (!html.includes(opening)) throw new Error("The opening prose of the 1601 book was not found.");
  const style = `<style id="census-opening-style">
.document-body #sizma-estate { display: inline !important; }
.document-body #body-sizma-estate { display: contents; }
.document-body #body-sizma-estate[hidden] { display: none !important; }
.document-body #body-sizma-estate > .census-opening-prose { display: inline; margin: 0 !important; padding: 0 !important; text-indent: 0 !important; }
</style>`;
  return html.replace(opening, replacement).replace("</head>", `${style}</head>`);
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(joinOpeningProse(document.html), bookId);
};
