import { copyFile, mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");
const backupPath = path.join(root, "data", "backups");
const host = "127.0.0.1";
const port = Number(process.env.DB_ADMIN_PORT ?? 4174);
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
const db = () => {
  const database = new DatabaseSync(databasePath);
  database.exec("PRAGMA foreign_keys = ON");
  return database;
};
const tableNames = (database) => new Set(database.prepare(`
  SELECT name
  FROM sqlite_master
  WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
`).all().map(({ name }) => name));
const schema = (database, table) => {
  if (!tableNames(database).has(table)) throw new Error("Недопустимая таблица.");
  return database.prepare(`PRAGMA table_info(${quote(table)})`).all();
};
const primaryKey = (columns) => columns.filter((column) => column.pk).sort((a, b) => a.pk - b.pk);
const readBody = async (request) => {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 5_000_000) throw new Error("Слишком большой запрос.");
  }
  return JSON.parse(body || "{}");
};
const send = (response, status, data) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(data));
};
const sendPage = (response) => {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  response.end(page);
};
const backup = async () => {
  await mkdir(backupPath, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const target = path.join(backupPath, `belozerye-${stamp}.sqlite`);
  await copyFile(databasePath, target);
  return path.relative(root, target);
};
const valueForStorage = (value, type) => {
  if (value === "" || value === null) return null;
  if (/INT/iu.test(type)) return Number.parseInt(value, 10);
  if (/REAL|FLOA|DOUB/iu.test(type)) return Number(value);
  return String(value);
};
const runBuild = () => new Promise((resolve) => {
  const child = spawn("npm.cmd", ["run", "build"], {
    cwd: root,
    windowsHide: true,
    shell: process.platform === "win32"
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  child.on("close", (code) => resolve({ ok: code === 0, output: output.slice(-12000) }));
});

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${host}:${port}`);
    if (request.method === "GET" && url.pathname === "/") return sendPage(response);
    if (request.method === "GET" && url.pathname === "/api/tables") {
      const database = db();
      const tables = [...tableNames(database)].sort().map((name) => ({ name, count: database.prepare(`SELECT COUNT(*) AS count FROM ${quote(name)}`).get().count }));
      database.close();
      return send(response, 200, tables);
    }
    if (request.method === "GET" && url.pathname === "/api/rows") {
      const table = url.searchParams.get("table");
      const query = (url.searchParams.get("q") ?? "").trim();
      const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
      const pageSize = 100;
      const database = db();
      const columns = schema(database, table);
      const where = query ? ` WHERE ${columns.map((column) => `CAST(${quote(column.name)} AS TEXT) LIKE ?`).join(" OR ")}` : "";
      const values = query ? columns.map(() => `%${query}%`) : [];
      const total = database.prepare(`SELECT COUNT(*) AS count FROM ${quote(table)}${where}`).get(...values).count;
      const rows = database.prepare(`SELECT * FROM ${quote(table)}${where} LIMIT ? OFFSET ?`).all(...values, pageSize, (page - 1) * pageSize);
      database.close();
      return send(response, 200, { columns, rows, total, page, pageSize });
    }
    if (request.method === "GET" && url.pathname === "/api/record") {
      const table = url.searchParams.get("table");
      const key = JSON.parse(url.searchParams.get("key") ?? "{}");
      const database = db();
      const columns = schema(database, table);
      const keys = primaryKey(columns);
      if (keys.length === 0 || keys.some((column) => !(column.name in key))) throw new Error("Не задан первичный ключ записи.");
      const where = keys.map((column) => `${quote(column.name)} = ?`).join(" AND ");
      const row = database.prepare(`SELECT * FROM ${quote(table)} WHERE ${where}`).get(...keys.map((column) => key[column.name]));
      database.close();
      return send(response, row ? 200 : 404, { columns, keys, row });
    }
    if (request.method === "PUT" && url.pathname === "/api/record") {
      const { table, key, values } = await readBody(request);
      const database = db();
      const columns = schema(database, table);
      const keys = primaryKey(columns);
      if (keys.some((column) => !(column.name in key))) throw new Error("Не задан первичный ключ записи.");
      const writable = columns.filter((column) => !column.pk && Object.hasOwn(values, column.name));
      if (writable.length === 0) throw new Error("Нет полей для сохранения.");
      const backupFile = await backup();
      const set = writable.map((column) => `${quote(column.name)} = ?`).join(", ");
      const where = keys.map((column) => `${quote(column.name)} = ?`).join(" AND ");
      database.prepare(`UPDATE ${quote(table)} SET ${set} WHERE ${where}`).run(
        ...writable.map((column) => valueForStorage(values[column.name], column.type)),
        ...keys.map((column) => key[column.name])
      );
      database.close();
      return send(response, 200, { ok: true, backupFile });
    }
    if (request.method === "POST" && url.pathname === "/api/build") return send(response, 200, await runBuild());
    send(response, 404, { error: "Не найдено." });
  } catch (error) {
    send(response, 400, { error: error.message });
  }
});

const page = String.raw`<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Белозерье · база данных</title>
<style>
*{box-sizing:border-box}body{margin:0;font:15px system-ui,sans-serif;background:#f5f0e4;color:#2e2922}header{padding:18px 24px;background:#2f4637;color:#fff;display:flex;gap:18px;align-items:center}h1{font:600 21px Georgia,serif;margin:0}button,input,textarea{font:inherit}button{cursor:pointer;border:0;border-radius:7px;padding:9px 12px;background:#d67d35;color:#fff;font-weight:650}button.secondary{background:#e5dfd0;color:#40382d}.layout{display:grid;grid-template-columns:250px 1fr;min-height:calc(100vh - 60px)}aside{padding:15px;background:#ebe4d5;border-right:1px solid #d5ccbb}.table-button{width:100%;display:flex;justify-content:space-between;background:none;color:#392f25;text-align:left;padding:9px}.table-button.active{background:#fff;color:#9a4216}.count{opacity:.65}main{padding:24px;min-width:0}.toolbar{display:flex;gap:10px;align-items:center;margin-bottom:15px}.toolbar input{padding:9px;border:1px solid #c9bda8;border-radius:7px;min-width:280px;background:#fff}table{border-collapse:collapse;width:100%;background:#fff;box-shadow:0 1px 6px #3f30151c}.grid-scroll{overflow:auto}.grid-top-scroll{height:18px;overflow-x:auto;overflow-y:hidden;margin-bottom:4px}.grid-top-scroll-content{height:1px}th,td{padding:9px 11px;border-bottom:1px solid #eee7da;text-align:left;max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}th{background:#f5f0e4;font-size:12px;text-transform:uppercase;color:#725f4b}tr:hover{background:#fff8eb}.editor{position:fixed;right:0;top:0;width:min(680px,100vw);height:100vh;background:#fff;box-shadow:-5px 0 20px #0003;padding:23px;overflow:auto;transform:translateX(102%);transition:.2s}.editor.open{transform:translateX(0)}.editor header{margin:-23px -23px 18px;padding:17px 23px}.field{display:grid;gap:5px;margin:12px 0}.field label{font-weight:650}.field input,.field textarea{width:100%;border:1px solid #cfc3b0;border-radius:6px;padding:8px}.field textarea{min-height:96px;font:13px ui-monospace,monospace}.field small{color:#76695b}.notice{margin-left:auto;font-size:13px}.ok{color:#ecffc6}.error{color:#b22318;margin:12px 0}@media(max-width:700px){.layout{grid-template-columns:1fr}aside{border-right:0}.table-list{display:flex;gap:5px;overflow:auto}.table-button{white-space:nowrap;width:auto}.toolbar{flex-wrap:wrap}}
</style><body><header><h1>Белозерье · редактор базы</h1><button id="build">Сохранить сайт</button><span class="notice" id="notice">Локальный доступ: только этот компьютер</span></header><div class="layout"><aside><strong>Таблицы</strong><div class="table-list" id="tables"></div></aside><main><div class="toolbar"><input id="search" placeholder="Поиск в текущей таблице"><button class="secondary" id="refresh">Обновить</button></div><div id="status"></div><div class="grid-top-scroll" id="grid-top-scroll" aria-label="Горизонтальная прокрутка таблицы"><div class="grid-top-scroll-content" id="grid-top-scroll-content"></div></div><div class="grid-scroll" id="grid-scroll"><table id="grid"></table></div></main></div><section class="editor" id="editor"><header><h1 id="editorTitle">Запись</h1><button class="secondary" id="close">Закрыть</button></header><form id="form"></form></section>
<script>
let activeTable='',activeColumns=[];const qs=s=>document.querySelector(s), api=async(url,options)=>{const r=await fetch(url,options);const data=await r.json();if(!r.ok)throw Error(data.error||'Ошибка');return data};const say=(text,kind='')=>qs('#status').innerHTML='<p class="'+kind+'">'+text+'</p>';
async function tables(){const all=await api('/api/tables');qs('#tables').innerHTML=all.map(x=>'<button class="table-button" data-table="'+x.name+'"><span>'+x.name+'</span><span class="count">'+x.count+'</span></button>').join('');document.querySelectorAll('[data-table]').forEach(x=>x.onclick=()=>{activeTable=x.dataset.table;document.querySelectorAll('[data-table]').forEach(y=>y.classList.toggle('active',y===x));rows()});if(!activeTable){activeTable='places';document.querySelector('[data-table="places"]').classList.add('active')}rows()}
async function rows(){try{const data=await api('/api/rows?table='+encodeURIComponent(activeTable)+'&q='+encodeURIComponent(qs('#search').value));activeColumns=data.columns;const keys=data.columns.filter(x=>x.pk).sort((a,b)=>a.pk-b.pk);qs('#grid').innerHTML='<thead><tr>'+data.columns.map(x=>'<th>'+x.name+'</th>').join('')+'</tr></thead><tbody>'+data.rows.map(row=>'<tr data-key="'+encodeURIComponent(JSON.stringify(Object.fromEntries(keys.map(x=>[x.name,row[x.name]]))))+'">'+data.columns.map(x=>'<td title="'+String(row[x.name]??'').replaceAll('&','&amp;').replaceAll('"','&quot;')+'">'+String(row[x.name]??'')+'</td>').join('')+'</tr>').join('')+'</tbody>';document.querySelectorAll('#grid tbody tr').forEach(x=>x.onclick=()=>openRecord(JSON.parse(decodeURIComponent(x.dataset.key))));say(data.rows.length?'Показано до 100 записей. Нажмите строку для редактирования.':'Ничего не найдено.')}catch(e){say(e.message,'error')}}
async function openRecord(key){const data=await api('/api/record?table='+encodeURIComponent(activeTable)+'&key='+encodeURIComponent(JSON.stringify(key)));qs('#editorTitle').textContent=activeTable;const keyNames=new Set(data.keys.map(x=>x.name));qs('#form').innerHTML=data.columns.map(c=>{const v=data.row[c.name]??'';const big=c.name==='html'||c.name.endsWith('_json')||String(v).length>160;return '<div class="field"><label>'+c.name+(keyNames.has(c.name)?' · ключ':'')+'</label>'+(big?'<textarea '+(keyNames.has(c.name)?'readonly':'')+' name="'+c.name+'">'+String(v).replaceAll('<','&lt;')+'</textarea>':'<input '+(keyNames.has(c.name)?'readonly':'')+' name="'+c.name+'" value="'+String(v).replaceAll('&','&amp;').replaceAll('"','&quot;')+'">')+'<small>'+c.type+(c.notnull?' · обязательно':' · можно оставить пустым')+'</small></div>'}).join('')+'<button>Сохранить запись</button><p id="saveMsg"></p>';qs('#form').onsubmit=async e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.target));data.keys.forEach(x=>delete values[x.name]);try{const out=await api('/api/record',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({table:activeTable,key,values})});qs('#saveMsg').textContent='Сохранено. Резервная копия: '+out.backupFile;qs('#saveMsg').className='ok';tables()}catch(error){qs('#saveMsg').textContent=error.message;qs('#saveMsg').className='error'}};qs('#editor').classList.add('open')}
qs('#close').onclick=()=>qs('#editor').classList.remove('open');qs('#refresh').onclick=rows;qs('#search').oninput=()=>{clearTimeout(window.timer);window.timer=setTimeout(rows,250)};qs('#build').onclick=async()=>{qs('#notice').textContent='Собираю сайт…';const out=await api('/api/build',{method:'POST'});qs('#notice').textContent=out.ok?'Сайт обновлён.':'Сборка не выполнена.';if(!out.ok)say('<pre>'+out.output+'</pre>','error')};tables();
</script><script>
(() => {
  let page = 1, pages = 1;
  const topScroll = document.querySelector("#grid-top-scroll");
  const topScrollContent = document.querySelector("#grid-top-scroll-content");
  const gridScroll = document.querySelector("#grid-scroll");
  let syncingScroll = false;
  const syncScrollWidth = () => { topScrollContent.style.width = gridScroll.scrollWidth + "px"; };
  topScroll.addEventListener("scroll", () => {
    if (syncingScroll) return;
    syncingScroll = true;
    gridScroll.scrollLeft = topScroll.scrollLeft;
    syncingScroll = false;
  });
  gridScroll.addEventListener("scroll", () => {
    if (syncingScroll) return;
    syncingScroll = true;
    topScroll.scrollLeft = gridScroll.scrollLeft;
    syncingScroll = false;
  });
  new ResizeObserver(syncScrollWidth).observe(gridScroll);
  new MutationObserver(syncScrollWidth).observe(document.querySelector("#grid"), { childList: true, subtree: true });
  const toolbar = document.querySelector(".toolbar");
  const pager = document.createElement("span");
  pager.style.cssText = "display:flex;gap:8px;align-items:center";
  pager.innerHTML = '<button class="secondary" type="button" data-page="previous">←</button><span data-page-label></span><button class="secondary" type="button" data-page="next">→</button>';
  toolbar.append(pager);
  const previous = pager.querySelector('[data-page="previous"]');
  const next = pager.querySelector('[data-page="next"]');
  const label = pager.querySelector("[data-page-label]");
  const render = () => { label.textContent = "Страница " + page + " из " + pages; previous.disabled = page <= 1; next.disabled = page >= pages; };
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, options) => {
    const url = String(input);
    const isRows = url.includes("/api/rows?");
    const response = await originalFetch(isRows ? url + "&page=" + page : input, options);
    if (isRows && response.ok) {
      const data = await response.clone().json();
      page = data.page;
      pages = Math.max(1, Math.ceil(data.total / data.pageSize));
      render();
    }
    return response;
  };
  previous.onclick = () => { if (page > 1) { page -= 1; rows(); } };
  next.onclick = () => { if (page < pages) { page += 1; rows(); } };
  document.addEventListener("click", (event) => { if (event.target.closest("[data-table]")) page = 1; }, true);
  document.querySelector("#search").addEventListener("input", () => { page = 1; });
  render();
})();
</script></body></html>`;

server.listen(port, host, () => console.log(`Редактор базы: http://${host}:${port}`));
