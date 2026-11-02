export const up = (db) => {
  db.prepare("UPDATE churches SET location_place_id = NULL WHERE id = ?")
    .run("rozhdestva-bogoroditsy-churovskaya-1544");
};
