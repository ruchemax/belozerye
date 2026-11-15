export const up = (db) => {
  db.exec("ALTER TABLE mentions ADD COLUMN match_reason TEXT");
  const update = db.prepare("UPDATE mentions SET match_reason = ? WHERE id = ? AND match_reliability = 'probable'");
  update.run(
    "В Тарутине в 1544 году жил Иванко Фертистов. В 1601 году названа пустошь Фертистово; предполагается её соответствие Феоктистовой 1626/27 года. Гипотезу поддерживает совпадение окружения поселений.",
    "mention-belozersky-1544-place-7-3"
  );
  update.run(
    "В Самсоновой Дубровке в 1544 году жил Мороз Бурцов. Предполагается переименование поселения в Морозово, названное в 1601 и 1626/27 годах. Гипотезу поддерживает совпадение окружения поселений.",
    "mention-belozersky-1544-place-5-13"
  );
};
