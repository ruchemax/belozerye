// Only existing cards are used. Ambiguous homonyms remain unattached.
export const settlementMatches = [
  [1,"rodino"], [2,"nazarovo"], [3,"charoma","Большей Двор назван Чяромскими; в 1559 году здесь записаны Чяромские, а в 1626/27 — село Ильинское, Большой Двор тож."],
  [4,"brykino"], [5,"olekseeva"], [6,"golobokovo","Голобокое сопоставлено с Голобоковым 1544 года по редкому названию и принадлежности к той же монастырской вотчине. Прямого совпадения жителей нет."],
  [8,"nikitino-1559"], [9,"derevnya-ivashevo-na-rechke-na-ulolmke-1626-2"],
  [10,"derevnya-anshukovo-na-rechke-na-ulomke-1626-40","Оншюково сопоставлено с Аншуковым по близкому названию и контексту монастырской вотчины рядом с Ивашевом и Кощеевым. В 1601 году река и жители не названы."],
  [11,"koshcheevo","Кощиево сопоставлено с Кощеевым на Уломке по близкому названию и контексту той же монастырской вотчины; рядом перечислены Ивашево и Оншюково."],
  [12,"romanovo","Романниково сопоставлено с Романницовым 1626/27 года по близкому названию и принадлежности к той же монастырской вотчине. Дупельное отдельно названо в обеих книгах."],
  [13,"romanovskoe","Дупельное сопоставлено с Дупелневым на Уломке 1626/27 года и Раменьем Дупельным 1544 года по характерному названию и монастырской принадлежности."],
  [14,"borisovo"], [15,"pustosh-demino-1626-64"],
  [17,"knyazhe","Князево сопоставлено с Княжьем 1544 года и Княжей 1626/27 года по основе названия и контексту той же монастырской вотчины. Прямого совпадения жителей нет."],
  [18,"bronnikovo"],
  [21,"savinskoe","Большой Двор на Колинце соответствует Савинскому, называемому Великим Двором, в 1544 году и Большому Двору на Коленце в 1626/27 году. Отдельный Большей Двор в Чяромских не объединён с ним."],
  [24,"aristov","Аристова сопоставлена с починком Аристовым 1544 года по названию и прямому указанию Коленца в обеих записях."],
  [25,"pestovo"], [26,"perkhino"], [27,"kolyshino"], [28,"ivantsovo"], [29,"obukhovo-ugla"],
  [30,"seltsa"], [31,"oksenovo"], [32,"sintsovskoe"], [33,"igaya"], [34,"bovynin"],
  [35,"derevnya-gnevosheva-na-rechke-na-chyurovke-1626-30"], [36,"sofonovo"], [37,"durakov"],
  [38,"ovinets"], [39,"derevnya-pochinok-na-rechke-na-chyurovke-1626-34"], [40,"drozdovo"],
  [41,"chyuravskaya-nov"], [42,"kurgany"], [43,"voroshnino"], [44,"okoemovo"],
  [45,"sosnovka-monastery"], [46,"golodyaevo"], [47,"bezsoloe"],
  [49,"larino"], [49,"selishche"],
  [50,"pustosh-agarevo-1626-101","Огарково в Судбицах сопоставлено с монастырской пустошью Агарево 1626/27 года по близкому названию. В поздней записи жители не названы, поэтому соответствие предположительное."],
  [51,"poteryaevo"], [52,"kharlamovo"], [53,"peshkov"], [54,"krasnoe"], [55,"selivanov"],
  [56,"pustosh-ignashkovo-1626-81","Игнашино сопоставлено с Игнашковым 1626/27 года по близкому названию и принадлежности к той же монастырской вотчине. Жителей для сравнения нет."],
  [57,"putilovo-1559"], [58,"pustosh-lodygino-1626-80"],
  [60,"krushkovo","Кружково сопоставлено с Крушковым Чаромского ключа по близкому названию и монастырской принадлежности. В оброчнике 1559 года Крушково также имеет выть."],
  [62,"grishiev","Грешнево сопоставлено с монастырской пустошью Гришнево 1626/27 года по близкому названию. Соответствие предположительное, поскольку в 1601 году жители не названы."],
  [63,"pustosh-makarovo-1626-77"],
  [64,"gologuzovo-ugla","Гологузка сопоставлена с починком Гологузовым монастырской вотчины 1544 года по близкому названию и землевладению. Селище Гологузово из другого контекста книги 1626/27 года не присоединялось."],
  [65,"tishinskoe"],
  [66,"shevyrino","Шовырино сопоставлено с Шевырином 1559 года по близкому названию и монастырской принадлежности; в обеих записях выть."],
  [67,"pustosh-rusanova-1626-105"], [72,"fedotov"],
  [73,"golobokovo","Голобокая — та же деревня, что Голобокое в жилом списке 1601 года: здесь отдельно учтена её пустующая доля. Связь с Голобоковым 1544 года предположительна по названию и вотчине."],
  [74,"kotovo"],
  [75,"pustosh-agafonova-1626-83","Агафоново сопоставлено с Агафоновой 1626/27 года по названию и принадлежности к той же монастырской вотчине; отличаются окончания."],
  [77,"vysokoe-ugla"], [79,"derevnya-1626-6"], [80,"pustosh-mishkino-1626-62"], [82,"telyatnik"],
  [83,"fomkin","Фоминская сопоставлена с монастырской пустошью Фоминское 1626/27 года по близкому названию. Прямых именных подтверждений в записи 1601 года нет."],
  [85,"savin","Савино сопоставлено с починком Савиным 1544 года по названию и контексту монастырской вотчины. С Савинским, называемым Великим Двором, эта запись не объединялась."],
  [86,"pustosh-morozovo-1626-91"],
  [89,"pustosh-mordvinovo-1626-88","Мердвинино сопоставлено с Мервядиным 1559 года и Мордвиновым 1626/27 года по близким формам названия и монастырской принадлежности. Жителей для прямого сравнения в записи 1601 года нет."],
  [90,"sokolovo"], [92,"pustosh-stupnevo-1626-85"],
  [95,"pustosh-feoktistova-1626-99","Фертистово сопоставлено с Феоктистовой 1626/27 года по близкому названию и монастырской принадлежности. В связанном починке Тарутине 1544 года назван Иванко Фертистов; это дополнительная зацепка, а не доказанное переименование."],
  [100,"pustosh-kvasino-1626-51","Квасинино сопоставлено с Квасиным 1626/27 года по близкому названию и принадлежности к той же монастырской вотчине. Жителей для сравнения нет."],
  [101,"pustosh-kuchino-1626-96"], [102,"pustosh-retino-1626-50"], [103,"pustosh-sinitsyno-1626-95"]
];

const plain = (s) => s.replace(/<span class="page-mark">[\s\S]*?<\/span>/gu, "").replace(/<[^>]+>/gu, "").replace(/\s+/gu, " ").trim();
const fragmentId = (n) => `kirillov-1601-fragment-${String(n).padStart(3,"0")}`;

export const up = (db) => {
  const bookId = "kirillov-1601";
  let html = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId)?.html;
  if (!html) throw new Error("The 1601 book was not found.");
  const addMention = db.prepare("INSERT INTO mentions (id,place_id,fragment_id,source_name,match_reliability,match_reason) VALUES (?,?,?,?,?,?)");
  const addUnit = db.prepare("INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key) VALUES (?,?,?)");
  const addName = db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,?,?,'ru','attested')");
  const addState = db.prepare(`INSERT INTO place_name_states (id,place_id,place_name_id,type_code,source_mention_id,observed_year,display_period,assertion_kind,position) VALUES (?,?,?,?,?,'1601','1601','observed',?)`);
  db.prepare("INSERT OR IGNORE INTO administrative_units (id,kind,name) VALUES ('subdivision:sizma-1601','subdivision','Сизма')").run();
  const sizmaUnit = db.prepare("SELECT id FROM administrative_units WHERE kind='subdivision' AND name='Сизма'").get().id;
  db.prepare("INSERT OR IGNORE INTO administrative_units (id,kind,name) VALUES ('subdivision:Чяромские','subdivision','Чяромские')").run();
  const attach = (id, placeId, sourceName, name, type, units, reason) => {
    const place = db.prepare("SELECT slug FROM places WHERE id=?").get(placeId);
    if (!place) throw new Error(`Unknown settlement ${placeId}.`);
    const mentionId = `${id.replace("fragment","mention")}-${placeId}`;
    addMention.run(mentionId,placeId,id,sourceName,reason ? "probable" : "exact",reason ?? null);
    addUnit.run(mentionId,"uezd:Белозерский","uezd");
    for (const unit of units) {
      if (!db.prepare("SELECT 1 FROM administrative_units WHERE id=?").get(unit)) throw new Error(`Unknown unit ${unit} for ${id}.`);
      addUnit.run(mentionId,unit,"subdivision");
    }
    db.prepare("INSERT INTO mention_land_categories (mention_id,position,code,label) VALUES (?,0,'monastery','Монастырская')").run(mentionId);
    db.prepare("INSERT INTO mention_land_category_owners (mention_id,land_category_position,land_owner_id,position) VALUES (?,0,'kirillo-belozersky-monastery',0)").run(mentionId);
    let nameId = db.prepare("SELECT id FROM place_names WHERE place_id=? AND name=?").get(placeId,name)?.id;
    if (!nameId) { nameId=`attested:${mentionId}`; addName.run(nameId,placeId,name); }
    const position = db.prepare("SELECT COALESCE(MAX(position),-1)+1 AS n FROM place_name_states WHERE place_id=?").get(placeId).n;
    addState.run(`observed:${mentionId}`,placeId,nameId,type,mentionId,position);
    const newer = db.prepare("SELECT 1 FROM place_name_states WHERE place_id=? AND CAST(observed_year AS INTEGER)>1601 LIMIT 1").get(placeId);
    if (!newer && !reason) db.prepare("UPDATE places SET name=?,type_code=?,name_origin='observed' WHERE id=?").run(name,type,placeId);
    return place.slug;
  };
  const grouped = new Map();
  for (const row of settlementMatches) {
    const rows = grouped.get(row[0]) ?? []; rows.push(row); grouped.set(row[0], rows);
  }
  for (const [number, matches] of grouped) {
    const id=fragmentId(number);
    const pattern=new RegExp(`(<h3[^>]*id="${id}-heading"[^>]*>)([\\s\\S]*?)(<\\/h3>)`,"u");
    const heading=pattern.exec(html);
    if (!heading) throw new Error(`Missing heading ${id}.`);
    const label=plain(heading[2]);
    const type=number>=53 && number!==73 ? "pustosh" : "village";
    const units=[sizmaUnit];
    if (number<=19) units.push("subdivision:Чяромские");
    else if(number<=24) units.push("subdivision:Коленца");
    else if(number<=48) units.push("subdivision:Запогостье");
    else if(number<=52) units.push("subdivision:Судбицах");
    let linked=heading[2];
    for (const [,placeId,reason] of matches) {
      const name=number===49 ? (placeId==="larino" ? "Заречье" : "Селища")
        : label.replace(/^(?:Деревня|Пустошь|В деревне)\s+/u,"").replace(/, Чяромские$/u,"");
      const sourceName=number===49 ? `Деревня ${name}` : number===73 ? "В деревне Голобокой" : label;
      const slug=attach(id,placeId,sourceName,name,type,units,reason);
      if(number===49) {
        linked=linked.replace(name,`<a class="place-title-link" href="../../places/${slug}/">${name}</a>`);
      } else {
        const marker=/<span class="page-mark">[\s\S]*?<\/span>\s*/u.exec(linked)?.[0] ?? "";
        linked=marker+`<a class="place-title-link" href="../../places/${slug}/">${linked.replace(marker,"")}</a>`;
      }
    }
    html=html.replace(pattern,(_,a,_b,c)=>a+linked+c);
  }
  // This prose passage is a separate attestation of Tarasovo, not a new text addition.
  const tarasovProse='<p class="record-prose">В деревне на Тарасове монастырские пашни 2 выти, пашют крестьяня на монастырь.</p>';
  if(!html.includes(tarasovProse)) throw new Error("The Tarasovo passage was not found.");
  const tarasovId="kirillov-1601-fragment-tarasovo";
  db.prepare("INSERT INTO fragments (id,book_id,source_heading_id,folio,position,raw_json) VALUES (?,?,?,'37об.',104,?)").run(tarasovId,bookId,`${tarasovId}-heading`,JSON.stringify({source_name_override:"В деревне на Тарасове"}));
  attach(tarasovId,"tarasova","В деревне на Тарасове","Тарасово","village",[sizmaUnit,"subdivision:Чяромские"]);
  html=html.replace(tarasovProse,`<section class="record place-record" id="${tarasovId}"><div class="record-heading-line"><h3 class="record-title place-heading" id="${tarasovId}-heading"><a class="place-title-link" href="../../places/tarasova/">В деревне на Тарасове</a></h3> <span class="heading-inline-prose">монастырские пашни 2 выти, пашют крестьяня на монастырь.</span></div></section>`);
  const tocEntry=`<div class="contents-entry contents-level-3" data-contents-entry data-contents-level="3"><a class="contents-link" href="#${tarasovId}-heading">В деревне на Тарасове</a></div>`;
  html=html.replace('<div class="contents-entry contents-level-2" data-contents-entry data-contents-level="2"><a class="contents-link" href="#charoma-villages">',tocEntry+'<div class="contents-entry contents-level-2" data-contents-entry data-contents-level="2"><a class="contents-link" href="#charoma-villages">');
  const churchGroups = [
    ["charoma-churches","37об.",[
      ["церковь Илия пророк","ili-proroka-charoma"],
      ["церковь Андрей Первозванный","andreya-pervozvannogo-charoma"]
    ]],
    ["kolinets-church","37об.",[["церковь Кирил чюдотворец","kirilla-belozerskogo-pishchalinskoe"]]],
    ["zapogostye-churches","38",[
      ["церковь теплая Рождество Христово","rozhdestva-khristova-zapogost"],
      ["церковь Рождество пресвятыя Богородицы","rozhdestva-bogoroditsy-churovskaya-1544"]
    ]]
  ];
  for(const [suffix,folio,churches] of churchGroups) {
    const id=`kirillov-1601-fragment-${suffix}`;
    const first=churches[0][0];
    const index=html.indexOf(first);
    const start=html.lastIndexOf('<p class="record-prose',index);
    const end=html.indexOf('</p>',index)+4;
    if(index<0 || start<0 || end<4) throw new Error(`Missing church passage ${suffix}.`);
    const p=html.slice(start,end);
    const inline=suffix==="charoma-churches";
    let section=inline ? p.replace('<p class="record-prose census-opening-prose">',`<section class="record church-source-fragment census-opening-prose" id="${id}">`).replace('</p>','</section>')
      : `<section class="record church-source-fragment" id="${id}">${p}</section>`;
    for(const [name,churchId] of churches) {
      if(!db.prepare("SELECT 1 FROM churches WHERE id=?").get(churchId)) throw new Error(`Unknown church ${churchId}.`);
      section=section.replace(name,`<a href="../../churches/${churchId}/">${name}</a>`);
    }
    html=html.slice(0,start)+section+html.slice(end);
    db.prepare("INSERT INTO fragments (id,book_id,source_heading_id,folio,position,raw_json) VALUES (?,?,?,?,?,?)").run(id,bookId,id,folio,105+churchGroups.findIndex(g=>g[0]===suffix),JSON.stringify({church_source_only:true}));
    for(const [,churchId] of churches) db.prepare("INSERT INTO church_sources (church_id,fragment_id) VALUES (?,?)").run(churchId,id);
  }
  const book=db.prepare("SELECT raw_json FROM books WHERE id=?").get(bookId);
  db.prepare("UPDATE books SET raw_json=? WHERE id=?").run(JSON.stringify({...JSON.parse(book.raw_json),manage_place_links:false}),bookId);
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  if(db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after linking the 1601 book.");
};
