export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const section = /<section\b[^>]*\bid="belozersky-1626-fragment-svatkova"[^>]*>[\s\S]*?<\/section>/u;
  if (!document || !section.test(document.html)) throw new Error("The Svatkova source record was not found.");
  const paragraph = /(<p\b[^>]*>)а в ней двор пуст (<span\b[^>]*>Ивашка Мельникова<\/span>), двор пуст (<span\b[^>]*>Пронки Омельянова<\/span>)\. ([\s\S]*?)<\/p>/u;
  const html = document.html.replace(section, (record) => {
    if (!paragraph.test(record)) throw new Error("The two Svatkova courtyards were not found in their expected form.");
    return record.replace(paragraph, (_match, opening, first, second, remainder) => {
      const courtyard = opening.replace("<p", '<p class="courtyard"');
      return `${opening}а в ней:</p>${courtyard}Двор пуст ${first}.</p>${courtyard}Двор пуст ${second}.</p>${opening}${remainder}</p>`;
    });
  });
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
