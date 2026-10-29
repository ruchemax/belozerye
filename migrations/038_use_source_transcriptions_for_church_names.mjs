export const up = (db) => {
  // churches.name stores the name transcription from the source.
  // The display-only "Church" prefix is added when rendering cards and markers.
  const update = db.prepare("UPDATE churches SET name = ? WHERE id = ?");
  const names = [
    ["Илья Пророк", "ilya-prophet-charoma"],
    ["Пречистые Богородицы и Чеснаго Рожества", "nativity-bogoroditsy-churovskaya"],
    ["Кирил Белозерской Чюдотворец", "kirill-belozersky-pishchalinskoe"],
    ["Богоявление Господа нашего Иисуса Христа", "bogoyavlenie-ugol"],
    ["страстотерпца Христова Георгия", "george-victorious-ugol"],
    ["Миколы Чюдотворца", "nicholas-chudotvorets-churovskaya"]
  ];
  for (const [name, id] of names) update.run(name, id);
};
