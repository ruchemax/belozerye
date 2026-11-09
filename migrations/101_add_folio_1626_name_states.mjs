const types = new Map([
  ["село", "selo"], ["деревня", "village"], ["деревни", "village"],
  ["починок", "pochinok"], ["пустошь", "pustosh"], ["пустиш", "pustosh"],
  ["погост", "pogost"], ["селище", "selishche"]
]);

const cleanName = (value) => {
  const text = value.trim().replace(/[,\s.]+$/u, "");
  const bracketed = /^\[([^\]]+)\]$/u.exec(text);
  return (bracketed ? bracketed[1] : text.replace(/\s*\[[^\]]*\]/gu, ""))
    .replace(/\s+/gu, " ").trim();
};

const parseNames = (source) => {
  let text = source.replace(/\(л\.\s*[^)]+\)/giu, "").replace(/\s+/gu, " ").trim();
  if (text.startsWith("В Коленце на реке на Шексне погост")) {
    return { names: ["Коленец"], typeCode: "pogost", formerType: null };
  }
  text = text.replace(/^У погоста ж на церковной земле\s+/iu, "")
    .replace(/^Да к погос\[т\]у ж церковная\s+/iu, "");
  const prefix = /^(село|деревня|деревни|починок|пустошь|пустиш|погост|селище)(?:\s*,\s*|\s+)/iu.exec(text);
  if (!prefix) throw new Error(`Cannot extract the settlement type: ${source}`);
  const typeCode = types.get(prefix[1].toLocaleLowerCase("ru-RU"));
  text = text.slice(prefix[0].length);
  const former = /^что\s+(?:была|было|был|были)\s+(село|деревня|починок|пустошь|погост|селище)\s+/iu.exec(text);
  if (former) text = text.slice(former[0].length);
  text = text.replace(/\s+(?:на\s+(?:речке|реке|ручью|ручье|суходоле)|за\s+рекою)\s+[\s\S]*$/iu, "");
  const alternative = /,\s*(?:а\s+)?(.+?)\s+тож(?:\s*[, .]*)$/iu.exec(text);
  const names = alternative
    ? [text.slice(0, alternative.index), alternative[1]].map(cleanName)
    : [cleanName(text)];
  if (names.some(name => !name || name.includes(","))) throw new Error(`Cannot extract the settlement names: ${source}`);
  return { names: [...new Set(names)], typeCode, formerType: former ? types.get(former[1].toLocaleLowerCase("ru-RU")) : null };
};

export const up = (db) => {
  db.prepare("INSERT OR IGNORE INTO place_types (code, label) VALUES ('selo', 'Село')").run();
  const mentions = db.prepare(`
    SELECT mentions.id, mentions.place_id, mentions.source_name, books.year
    FROM mentions
    JOIN fragments ON fragments.id = mentions.fragment_id
    JOIN books ON books.id = fragments.book_id
    WHERE fragments.book_id = 'belozersky-1626'
      AND fragments.source_heading_id LIKE 'folios-547-561-place-%-heading'
    ORDER BY fragments.position
  `).all();
  const addName = db.prepare(`
    INSERT INTO place_names (id, place_id, name, language, name_kind)
    VALUES (?, ?, ?, 'ru', 'attested')
  `);
  const addState = db.prepare(`
    INSERT INTO place_name_states
      (id, place_id, place_name_id, type_code, source_mention_id,
       observed_year, display_period, assertion_kind, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const mention of mentions) {
    if (db.prepare("SELECT 1 FROM place_name_states WHERE source_mention_id = ? AND assertion_kind = 'observed'").get(mention.id)) continue;
    const parsed = parseNames(mention.source_name);
    let position = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS position FROM place_name_states WHERE place_id = ?")
      .get(mention.place_id).position;
    for (const [index, name] of parsed.names.entries()) {
      let nameId = db.prepare("SELECT id FROM place_names WHERE place_id = ? AND name = ?")
        .get(mention.place_id, name)?.id;
      if (!nameId) {
        nameId = `attested:${mention.id}:${index}`;
        addName.run(nameId, mention.place_id, name);
      }
      addState.run(`observed:${mention.id}:${index}`, mention.place_id, nameId,
        parsed.typeCode, mention.id, mention.year, mention.year, "observed", position++);
      if (parsed.formerType) {
        addState.run(`inferred:${mention.id}:${index}`, mention.place_id, nameId,
          parsed.formerType, mention.id, null, `до ${mention.year}`, "inferred", position++);
      }
    }
  }
};
