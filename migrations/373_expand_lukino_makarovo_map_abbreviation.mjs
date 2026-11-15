export const up = (db) => {
  const note = "Местоположение определено приблизительно внутри дачи генерального межевания №751 «Лукьяново и Макаришка» на плане генерального межевания Череповского уезда 1788 года.";
  const update = db.prepare("UPDATE place_geometries SET location_note = ? WHERE place_id = ?");
  for (const placeId of ["lukino", "pustosh-makarovo-1626-77"]) {
    if (update.run(note, placeId).changes !== 1) throw new Error(`Expected coordinates for ${placeId}.`);
  }
};
