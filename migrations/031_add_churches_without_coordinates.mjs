export const up = (db) => {
  const add = db.prepare("INSERT INTO churches VALUES (?, ?, ?, ?, ?, ?)");
  const rows = [
    ["kirill-belozersky-pishchalinskoe", "kirill-belozersky-pishchalinskoe", "Кирилла Белозерского Чудотворца", "belozersky_uezd-1544", "Сотная из писцовых книг Белозерского уезда (1544 г.)", "place-4-1"],
    ["bogoyavlenie-ugol", "bogoyavlenie-ugol", "Богоявления Господня", "belozersky_uezd-1585", "Писцовая книга 1585 г.", ""],
    ["george-victorious-ugol", "george-victorious-ugol", "Великомученика Георгия", "belozersky_uezd-1585", "Писцовая книга 1585 г.", ""],
    ["nicholas-chudotvorets-churovskaya", "nicholas-chudotvorets-churovskaya", "Николая Чудотворца", "belozersky_uezd-1626-27", "Писцовая книга Белозерского уезда (1626/27 г.)", "patriarchal-churchyard"]
  ];
  for (const row of rows) add.run(...row);
};
