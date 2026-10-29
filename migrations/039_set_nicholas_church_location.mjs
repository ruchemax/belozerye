export const up = (db) => {
  db.prepare("UPDATE churches SET location_place_id = ? WHERE id = ?")
    .run("pogost-rozhestva-bogoroditsy", "nicholas-chudotvorets-churovskaya");
};
