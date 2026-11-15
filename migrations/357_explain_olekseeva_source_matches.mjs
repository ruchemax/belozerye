export const up = (db) => {
  const reason = "Соответствие Филино и Елисеево указано в источнике 1559 года и также подтверждается проживанием в Филино Елисейка. Соответствие между Елисеево и Олексеево установлено предположительно на основании схожести названий, окружающих населённых пунктов и имён жителей: Панко Серков, Сафонко Панкратов, Мелентей, Максимко Мелентьев.";
  const update = db.prepare(`
    UPDATE mentions SET match_reliability = 'probable', match_reason = ?
    WHERE id = ? AND place_id = 'olekseeva'
  `);
  for (const id of [
    "mention-belozersky-1544-place-1-12",
    "kirillov-1559-mention-006",
    "kirillov-1559-mention-079"
  ]) {
    if (update.run(reason, id).changes !== 1) {
      throw new Error(`Expected one Olekseeva mention: ${id}.`);
    }
  }
};
