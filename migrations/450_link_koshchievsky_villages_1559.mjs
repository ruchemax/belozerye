import { readFile } from "node:fs/promises";

// Seed and rent references describe the same holdings, often naming the same tenants.
const matches = [
  [1,4,"borisovo"],
  [2,null,"gologuzovo-ugla"],
  [null,3,"pustosh-beusovo-1626-65"],
  [3,1,"grishiev","Гришнево (в оброчнике Гришенево) сопоставлено с Гришневым 1626/27 года и Грешневым 1601 года в монастырской вотчине. В 1559 и 1601 годах указаны 2 выти; починок Гришиев 1544 года имеет близкое название. Прямого совпадения жителей с другими годами нет."],
  [4,5,"romanovskoe"],
  [5,11,"koshcheevo"],
  [6,12,"derevnya-anshukovo-na-rechke-na-ulomke-1626-40","Дуброва сопоставлена с Оншюковым 1601 года и Аншуковым на Уломке 1626/27 года предположительно: в обоих списках 1559 года здесь назван Оншук, а в 1601 году Оншюково перечислено рядом с Кощиевым. Другая Дуброва в этой же книге занята Морозом; Дуброва Чюровской волости к этой записи не присоединялась."],
  [7,13,"saunkin","Сауниньская (Саунинская) сопоставлена с починком Саункиным 1544 года и Савуниным 1626/27 года по названию и монастырской принадлежности. В 1544 году назван Зуй Саунин, в 1559 году — Иван Зуев; это дополнительная зацепка, без доказанного родства."],
  [8,10,"derevnya-gorka-na-rechke-na-ulomke-1626-4"],
  [9,16,"pustosh-morozovo-1626-91","Дуброва семянника и Полежаево оброчника сопоставлены по одному жильцу Морозу, одинаковой выти и контексту Кощиевского ключа. В Самсоновой Дубровке 1544 года также назван Мороз Бурцов; эта запись уже связана с Морозовым 1601 и 1626/27 годов. Соответствие предположительное; Полежаево на Пустой Чюровке относится к другому контексту."],
  [10,17,"fomkin"],
  [11,18,"eremeevskoe","Еремино семянника и Еремиево оброчника — одна деревня: в обоих списках 2 выти и жители Фрол, Иода, Истома. Сопоставление с Еремиевым 1601 года, Еремейковой 1626/27 года и Еремеевским на Уломе 1544 года предположительное по вариантам названия и монастырской принадлежности."],
  [12,7,"modenov","Моденово сопоставлено с починком Моденовым 1544 года и пустошью Маденово 1626/27 года по близкому названию и принадлежности к той же монастырской вотчине. Прямого совпадения жителей с другими годами нет."],
  [13,9,"bronnikovo"],
  [14,21,"knyazhe","Княжо семянника и Княже оброчника сопоставлены с Княжьем 1544 года, Князевым 1601 года и Княжей 1626/27 года по вариантам названия и монастырской принадлежности. В обоих списках 1559 года 2 выти и жилец Лютой; связь с другими годами предположительная."],
  [15,20,"malchino"],
  [16,19,"sokolovo"],
  [17,6,"romanovo"],
  [18,2,"pustosh-makarovo-1626-77"],
  [19,8,"pustosh-stepanovskaya-1626-71","Степановская семянника и Пророково оброчника сопоставлены по жильцам Матюшке, Торопку и Кляпику и одинаковой выти. Связь со Степановской 1601 года и первой Степановской 1626/27 года предположительная: в 1601 году Фоминская и Степановская перечислены подряд, в 1626/27 году рядом стоят Фоминское, Маденово и Степановская. Отдельная Степановская на Коленце не присоединялась."],
  [20,15,"kuleberovo"],
  [21,14,"uzedi-1601","Узяди сопоставлены с Узедями 1601 года по близкому редкому названию и контексту монастырской вотчины. В 1559 году полвыти, в 1601 году треть выти; совпадения жителей для проверки нет."],
  [22,22,"savinskoe","Савинская семянника и Большей Двор оброчника — одна деревня на Коленце: в обоих списках 2 выти, Троша и Митя с братом. Сопоставление с Савинским, называемым Великим Двором, 1544 года, Большим Двором 1601 года и Большим Двором на Пиздавке 1626/27 года следует существующей карточке и остаётся предположительным."],
  [23,23,"malgin","Малгино на Коленце сопоставлено с починком Малгиным 1544 года, также указанным у Коленца, по названию и местному контексту. Прямого совпадения жителей нет. Другое Малгино Кощиевского ключа связано с отдельной карточкой Мальцова (Малгиева)."],
  [24,24,"kurakin","Куракино на Коленце сопоставлено с починком Куракиным 1544 года у Коленца и пустошью Куракино 1626/27 года по названию и монастырской принадлежности. Прямого совпадения жителей нет."],
  [26,26,"ramene"],
  [27,27,"aristov","Аристова семянника и Новцо оброчника сопоставлены по жильцам Ивану Климову (Ване) и Еле и одинаковой выти. Связь с починком Аристовым 1544 года и Аристовой 1601 года предположительная по названию и прямому указанию Коленца; в 1544 году здесь назван Аристко Бобров с сыном Есюком."],
  [29,null,"na-shchuche","Пустующая деревня Щучье сопоставлена с починком на Щучье 1544 года по названию и прямому указанию Коленца. В записи 1559 года жителей нет, поэтому соответствие предположительное."]
];

const fragmentId = (kind, number) => `kirillov-1559-${kind}-koshchievsky-${String(number).padStart(3,"0")}`;
const keyId = "subdivision:Кощиевский ключ";

export const up = async (db) => {
  const bookId = "kirillov-1559";
  const data = JSON.parse(await readFile(new URL("../content/books/kirillov_monastery-1559/koshchievsky-additions.json", import.meta.url), "utf8"));
  const records = Object.fromEntries(Object.entries(data).map(([key, entries]) => [key,entries.filter(e => e.type === "record")]));
  let html = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId)?.html;
  if (!html) throw new Error("The 1559 book was not found.");
  const placeCount = db.prepare("SELECT COUNT(*) AS n FROM places").get().n;
  db.prepare("INSERT INTO administrative_units (id,kind,name,parent_id) VALUES (?,'subdivision','Кощиевский ключ','volost:Сизма')").run(keyId);
  const addMention = db.prepare("INSERT INTO mentions (id,place_id,fragment_id,source_name,match_reliability,match_reason) VALUES (?,?,?,?,?,?)");
  const addUnit = db.prepare("INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key) VALUES (?,?,?)");
  const addFragmentUnit = db.prepare("INSERT INTO fragment_administrative_units (fragment_id,administrative_unit_id,context_key) VALUES (?,?,?)");
  const updated = new Set();
  for (const [seed,rent,placeId,reason] of matches) {
    const place = db.prepare("SELECT slug FROM places WHERE id=?").get(placeId);
    if (!place) throw new Error(`Unknown settlement ${placeId}.`);
    for (const [kind,number] of [["seed",seed],["rent",rent]]) {
      if (number === null) continue;
      const entry = records[kind][number-1];
      const id = fragmentId(kind,number);
      const fragment = db.prepare("SELECT * FROM fragments WHERE id=? AND book_id=?").get(id,bookId);
      if (!fragment || !entry || updated.has(id)) throw new Error(`Invalid source record ${id}.`);
      const pattern = new RegExp(`(<h3\\b[^>]*id="${fragment.source_heading_id}"[^>]*>)([\\s\\S]*?)(<\\/h3>)`,"u");
      const heading = pattern.exec(html);
      if (!heading || heading[2].includes("<a ")) throw new Error(`Missing or linked source heading ${id}.`);
      const marker = /<span class="page-mark">[\s\S]*?<\/span>\s*/u.exec(heading[2])?.[0] ?? "";
      html = html.replace(pattern,(_,a,label,c) => `${a}${marker}<a class="place-title-link" href="../../places/${place.slug}/">${label.replace(marker,"")}</a>${c}`);
      const mentionId = `mention:${id}`;
      addMention.run(mentionId,placeId,id,entry.title,reason ? "probable" : "exact",reason ?? null);
      const units = [["uezd:Белозерский","uezd"],["volost:Сизма","volost"],[keyId,"subdivision"]];
      if (number >= 22) units.push(["subdivision:Коленца","subdivision"]);
      for (const [unit,context] of units) {
        addUnit.run(mentionId,unit,context);
        addFragmentUnit.run(id,unit,context);
      }
      db.prepare("INSERT INTO mention_land_categories (mention_id,position,code,label) VALUES (?,0,'monastery','Монастырская')").run(mentionId);
      db.prepare("INSERT INTO mention_land_category_owners (mention_id,land_category_position,land_owner_id,position) VALUES (?,0,'kirillo-belozersky-monastery',0)").run(mentionId);
      const bare = entry.title.replace(/^(?:Деревня|Починок)\s+/u,"");
      const names = [bare.replace(/\s*\[[^\]]+\]/gu,"").trim(), ...[...bare.matchAll(/\[([^\]]+)\]/gu)].map(m=>m[1])];
      let position = db.prepare("SELECT COALESCE(MAX(position),-1)+1 AS n FROM place_name_states WHERE place_id=?").get(placeId).n;
      for (const [index,name] of [...new Set(names)].entries()) {
        let nameId = db.prepare("SELECT id FROM place_names WHERE place_id=? AND name=?").get(placeId,name)?.id;
        if (!nameId) {
          nameId = `attested:${mentionId}:${index}`;
          db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,?,?,'ru','attested')").run(nameId,placeId,name);
        }
        db.prepare(`INSERT INTO place_name_states (id,place_id,place_name_id,type_code,source_mention_id,observed_year,display_period,assertion_kind,position)
          VALUES (?,?,?,'village',?,'1559','1559','observed',?)`).run(`observed:${mentionId}:${index}`,placeId,nameId,mentionId,position++);
      }
      db.prepare("UPDATE fragments SET raw_json=? WHERE id=?").run(JSON.stringify({...JSON.parse(fragment.raw_json),source_name_override:entry.title}),id);
      updated.add(id);
    }
  }
  if (updated.size !== 53) throw new Error(`Expected 53 linked records, found ${updated.size}.`);
  if (db.prepare("SELECT COUNT(*) AS n FROM places").get().n !== placeCount) throw new Error("Existing cards only were expected.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after linking the Koshchievsky villages.");
};
