export const up = (db) => {
  const result = db.prepare("UPDATE administrative_units SET label='Сизма' WHERE id='volost:Сизма' AND kind='volost'").run();
  if (result.changes !== 1) throw new Error("The Sizma volost was not found.");
};
