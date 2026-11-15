export const up = (db) => {
  db.exec(`CREATE TABLE fragment_administrative_units (
    fragment_id TEXT NOT NULL REFERENCES fragments(id) ON DELETE CASCADE,
    administrative_unit_id TEXT NOT NULL REFERENCES administrative_units(id),
    context_key TEXT NOT NULL,
    PRIMARY KEY (fragment_id,context_key,administrative_unit_id)
  )`);
  const sources = [
    ["kirillov-1601-fragment-charoma-churches","subdivision:Чяромские"],
    ["kirillov-1601-fragment-kolinets-church","subdivision:Коленца"],
    ["kirillov-1601-fragment-zapogostye-churches","subdivision:Запогостье"]
  ];
  const insert = db.prepare("INSERT INTO fragment_administrative_units (fragment_id,administrative_unit_id,context_key) VALUES (?,?,?)");
  for (const [fragment,child] of sources) {
    insert.run(fragment,"uezd:Белозерский","uezd");
    insert.run(fragment,"volost:Сизма","volost");
    insert.run(fragment,child,"subdivision");
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid church fragment administration.");
};
