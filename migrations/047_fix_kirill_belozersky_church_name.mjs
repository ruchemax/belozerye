export const up = (db) => {
  db.prepare("UPDATE churches SET name = ? WHERE id = ?")
    .run("Кирилла Белозерского", "kirill-belozersky-pishchalinskoe");
};
