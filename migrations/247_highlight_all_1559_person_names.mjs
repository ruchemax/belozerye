const additionalNames = [
  "Ивана", "Федор", "Кирило", "Оги[й]", "Первуня", "Десятой", "Архип", "Родюка",
  "Лари", "Никиты", "Поздня", "Перелыги", "Еремка", "Иванко", "Сысойко",
  "Панко Корнилов", "Огей", "Федор Иванов", "Нечяй", "Ивша", "Некрас Ивойлов",
  "Петруша", "Нифуня", "Гаврилко", "Орех", "Сенька", "Ушак", "Олексий",
  "Дуроком", "Иванком", "Софон", "Софонко", "Тимоха", "Олекся", "Мисайло", "Васьян", "Нифатка"
];
const nonNames = new Set(["У", "З", "Сы", "Злисиева", "Дуракова", "Да", "Поп", "Вдова"]);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

export const formatDocument = (html) => {
  const start = html.indexOf('<div class="document-body">');
  const end = html.indexOf("<script", start);
  if (start < 0 || end < 0) throw new Error("The 1559 transcription body was not found.");
  const original = html.slice(start, end);
  const names = new Set(additionalNames);
  for (const match of original.matchAll(/<strong class="person-name">([\s\S]*?)<\/strong>/gu)) {
    for (let name of match[1].split(/\s+(?:да\s+у|да|у|з|с)\s+/u)) {
      name = name.replace(/^(?:У|Поп|Вдова)\s+/u, "");
      if (!nonNames.has(name)) names.add(name);
    }
  }
  const expression = new RegExp(`(?<![\\p{L}\\p{N}])(?:${[...names].sort((a, b) => b.length - a.length)
    .map(escapeRegex).join("|")})(?![\\p{L}\\p{N}])`, "gu");
  const body = original.replace(/<strong class="person-name">([\s\S]*?)<\/strong>/gu, "$1")
    .split(/(<[^>]+>)/u).map((part) => part.startsWith("<") ? part
      : part.replace(expression, '<strong class="person-name">$&</strong>')).join("");
  const text = (value) => value.replace(/<[^>]+>/gu, "");
  if (text(body) !== text(original)) throw new Error("Name formatting changed the transcription text.");
  return html.slice(0, start) + body + html.slice(end);
};

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
