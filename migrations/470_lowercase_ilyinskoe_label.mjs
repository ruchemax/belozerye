export const up = (db) => {
  const result = db.prepare(`UPDATE administrative_units SET label='село Ильинское'
    WHERE id='subdivision:село Ильинское' AND kind='selo'`).run();
  if (result.changes !== 1) throw new Error("The Ilyinskoe village unit was not found.");
};
