const originalHeadings = [
  [
    "belozersky-1585",
    "churovskaya",
    "<h1 class=\"primary-section-heading\" data-astro-cid-zcak6nys=\"\" id=\"churovskaya\"><span class=\"page-mark\" data-astro-cid-zcak6nys=\"\">(л. 1544)</span> Волость Чюровская пуста того ж Усть-Угольского приказу.</h1>"
  ],
  [
    "belozersky-1585",
    "place-3",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-3\"><a class=\"place-title-link\" href=\"../../places/fedosino/\" data-astro-cid-zcak6nys>Деревня Федосьино пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-4",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-4\"><a class=\"place-title-link\" href=\"../../places/krushkova/\" data-astro-cid-zcak6nys>Деревня Крушково пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "dor-levashev",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"dor-levashev\"><a class=\"place-title-link\" href=\"../../places/dor/\" data-astro-cid-zcak6nys>Деревня Дор Левашев пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-6",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-6\"><a class=\"place-title-link\" href=\"../../places/mikhaylovskaya/\" data-astro-cid-zcak6nys>Деревня Михайловская на речке на Имае пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-7",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-7\"><a class=\"place-title-link\" href=\"../../places/sogareva/\" data-astro-cid-zcak6nys>Деревня Согарева пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-8",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-8\"><a class=\"place-title-link\" href=\"../../places/pirogovo/\" data-astro-cid-zcak6nys>Деревня Пирогово на речке на Имае пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-9",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-9\"><a class=\"place-title-link\" href=\"../../places/slizovo/\" data-astro-cid-zcak6nys>Деревня Слизово пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-10",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-10\"><a class=\"place-title-link\" href=\"../../places/demsino/\" data-astro-cid-zcak6nys>Деревня Демсино пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-11",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-11\"><a class=\"place-title-link\" href=\"../../places/fofonovo/\" data-astro-cid-zcak6nys>Деревня Фофанова пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-12",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-12\"><a class=\"place-title-link\" href=\"../../places/isakovo/\" data-astro-cid-zcak6nys>Деревня Исаково пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-18",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-18\"><a class=\"place-title-link\" href=\"../../places/esipo-esino/\" data-astro-cid-zcak6nys>Деревня Есино пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-20",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-20\"><a class=\"place-title-link\" href=\"../../places/semkino/\" data-astro-cid-zcak6nys>Деревня Семкино пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-21",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-21\"><a class=\"place-title-link\" href=\"../../places/likhachevo/\" data-astro-cid-zcak6nys>Деревня Лихачево пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-25",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-25\"><a class=\"place-title-link\" href=\"../../places/fedorkovo/\" data-astro-cid-zcak6nys>Деревня Федорково пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-27",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-27\"><a class=\"place-title-link\" href=\"../../places/selittskoe/\" data-astro-cid-zcak6nys>Деревня Селецкое на речке на Черове пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "place-37",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"place-37\"><a class=\"place-title-link\" href=\"../../places/dryugino/\" data-astro-cid-zcak6nys>Деревня Дручино пуста</a><span class=\"heading-comma\" data-astro-cid-zcak6nys=\"\">,</span></h3>"
  ],
  [
    "belozersky-1585",
    "transferred-2",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"transferred-2\"><a class=\"place-title-link\" href=\"../../places/olesheva/\" data-astro-cid-zcak6nys>Деревня Олешева пуста на речке на Ираче.</a></h3>"
  ],
  [
    "belozersky-1585",
    "transferred-4",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"transferred-4\"><a class=\"place-title-link\" href=\"../../places/bodaga/\" data-astro-cid-zcak6nys>Деревня Бодага на речке на Имаче пуста.</a></h3>"
  ],
  [
    "belozersky-1585",
    "transferred-5",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"transferred-5\"><a class=\"place-title-link\" href=\"../../places/makarovo/\" data-astro-cid-zcak6nys>Деревня Макарово пуста на речке на Ираче.</a></h3>"
  ],
  [
    "belozersky-1585",
    "transferred-6",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"transferred-6\"><a class=\"place-title-link\" href=\"../../places/obukhovo-ramenskaya/\" data-astro-cid-zcak6nys>Деревня Обухово пуста.</a></h3>"
  ],
  [
    "belozersky-1585",
    "transferred-8",
    "<h3 class=\"place-heading\" data-astro-cid-zcak6nys=\"\" id=\"transferred-8\"><a class=\"place-title-link\" href=\"../../places/onanin-pochinok/\" data-astro-cid-zcak6nys>Деревня Онаньин Починок пуста.</a></h3>"
  ],
  [
    "belozersky-1585",
    "church-ievlevo",
    "<h3 class=\"place-heading church-place-heading\" data-astro-cid-zcak6nys=\"\" id=\"church-ievlevo\">Да тое ж Чюровские волости церковная деревня Иевлево пуста</h3>"
  ],
  [
    "belozersky-1626",
    "krushkova",
    "<h3 id=\"krushkova\" class=\"estate-heading place-heading\" data-astro-cid-zcak6nys><span data-astro-cid-zcak6nys><a class=\"place-title-link\" href=\"../../places/krushkova/\" data-astro-cid-zcak6nys>деревня Крушкова пуста</a></span><span class=\"heading-comma\" data-astro-cid-zcak6nys>,</span></h3>"
  ],
  [
    "belozersky-1626",
    "svatkova",
    "<h3 id=\"svatkova\" class=\"place-heading\" data-astro-cid-zcak6nys><span data-astro-cid-zcak6nys><a class=\"place-title-link\" href=\"../../places/svatkova/\" data-astro-cid-zcak6nys>[Деревня] Сваткова пуста на речке на Чюровке</a></span><span class=\"heading-comma\" data-astro-cid-zcak6nys>,</span></h3>"
  ]
];

export const up = (db) => {
  for (const [bookId, headingId, original] of originalHeadings) {
    const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
    const escapedId = headingId.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const heading = new RegExp(`<h([1-6])\\b(?=[^>]*\\bid="${escapedId}")[^>]*>[\\s\\S]*?<\\/h\\1>`, "u");
    if (!document || !heading.test(document.html)) throw new Error(`The heading ${headingId} was not found.`);
    const wordIndex = original.search(/(?<!\p{L})пуста(?!\p{L})/iu);
    const prefix = original.slice(0, wordIndex).trimEnd();
    const stack = [];
    for (const tag of prefix.matchAll(/<\/?([a-z][a-z0-9]*)\b[^>]*>/giu)) {
      if (tag[0].startsWith("</")) stack.pop();
      else if (!tag[0].endsWith("/>")) stack.push(tag[1]);
    }
    const title = (prefix + stack.reverse().map((tag) => `</${tag}>`).join(""))
      .replace(/^(<h[1-6]\b[^>]*\bclass=")([^"]*)/u, "$1$2 heading-with-status");
    const prose = original.slice(wordIndex).replace(/<[^>]*>/gu, "");
    const replacement = `${title}<span class="heading-status-prose"> ${prose}</span>`;
    db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
      .run(document.html.replace(heading, () => replacement), bookId);
  }
};
