export const up = (db) => {
  db.prepare("UPDATE places SET name = ? WHERE id IN (?, ?)")
    .run("Лошаково", "loshakova", "loshakovo-monastery");

  // Give the second 1544 mention to the metropolitan settlement so its card
  // shows the original source fragment as well as the merged 1626/27 record.
  db.prepare("UPDATE mentions SET place_id = ?, historical_name_override = ? WHERE id = ?")
    .run(
      "loshakova",
      "митрополичий починок Лошакова",
      "mention-belozersky-1544-place-12-1-monastery"
    );
};
