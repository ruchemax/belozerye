export const up = (db) => {
  db.prepare("UPDATE churches SET name = ? WHERE id = ?")
    .run("Церковь Страстотерпца Георгия", "georgiya-pobedonostsa-ugol");
};
