export const moveCharomaIntoSentence = (html) => {
  const heading = 'на Сизме в Чяромских.</h1>';
  const paragraph = '<p class="record-prose">Божие милосердие';
  if (!html.includes(heading) || !html.includes(paragraph)) {
    throw new Error("The expected 1601 opening heading and paragraph were not found.");
  }
  return html.replace(heading, 'на Сизме.</h1>')
    .replace(paragraph, '<p class="record-prose">В Чяромских, божие милосердие')
    .replace('>Да Белоозерскаго ж уезда Кирилова монастыря вотчина на Сизме в Чяромских</a>', '>Да Белоозерскаго ж уезда Кирилова монастыря вотчина на Сизме</a>');
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(moveCharomaIntoSentence(document.html), bookId);
};
