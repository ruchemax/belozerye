export const up = (db) => {
  const update = db.prepare("UPDATE churches SET name = ? WHERE id = ?");
  const names = [
    ["Церковь Ильи Пророка", "ili-proroka-charoma"],
    ["Церковь Рождества Богородицы", "rozhdestva-bogoroditsy-churovskaya"],
    ["Церковь Кирилла Белозерского", "kirilla-belozerskogo-pishchalinskoe"],
    ["Церковь Богоявления", "bogoyavlenie-ugol"],
    ["Церковь страстотерпца Христова Георгия", "georgiya-pobedonostsa-ugol"],
    ["Церковь Николая Чудотворца", "nikolaya-chudotvortsa-churovskaya"]
  ];
  for (const [name, id] of names) update.run(name, id);
};
