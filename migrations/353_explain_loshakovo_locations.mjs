export const up = (db) => {
  const reason = "В 1544 году монастырский и митрополичий починки Лошаково отмечены по разные стороны ручья Вязовик. Местоположение определено по положению ручья Вязовик на плане генерального межевания (ПГМ) Череповского уезда 1788 года.";
  const update = db.prepare(`
    UPDATE mentions SET match_reliability = 'probable', match_reason = ?
    WHERE place_id = ? AND fragment_id IN (SELECT id FROM fragments WHERE book_id = 'belozersky-1544')
  `);
  for (const placeId of ["loshakova", "loshakovo-monastery"]) {
    if (update.run(reason, placeId).changes !== 1) {
      throw new Error(`Expected one 1544 mention for ${placeId}.`);
    }
  }
};
