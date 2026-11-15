export const separateOpeningParagraph = (html) => {
  if (!html.includes('в Чяромских,</h1>')) throw new Error("The expected 1601 heading was not found.");
  let result = html
    .replace('в Чяромских,</h1>', 'в Чяромских.</h1>')
    .replace(/<style id="census-opening-style">[\s\S]*?<\/style>/u, "");
  const churchSection = /<section class="record church-source-fragment census-opening-prose" id="kirillov-1601-fragment-charoma-churches">божие([\s\S]*?)<\/section>/u;
  if (churchSection.test(result)) {
    result = result.replace(churchSection, '<section class="record church-source-fragment" id="kirillov-1601-fragment-charoma-churches"><p class="record-prose">Божие$1</p></section>');
  } else {
    const paragraph = '<p class="record-prose census-opening-prose">божие';
    if (!result.includes(paragraph)) throw new Error("The opening paragraph was not found.");
    result = result.replace(paragraph, '<p class="record-prose">Божие');
  }
  return result;
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(separateOpeningParagraph(document.html), bookId);
};
