import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const errors = [];
const titles = new Map();
const descriptions = new Map();

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolute) : [absolute];
  }));
  return nested.flat();
}

function report(file, message) {
  errors.push(`${path.relative(root, file)}: ${message}`);
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
  return match ? (match[1] ?? match[2]) : null;
}

function decodeUrl(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#38;", "&");
}

async function pathExists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

const files = await listFiles(dist);
const htmlFiles = files.filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const markup = html
    .replace(/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi, "$1$2")
    .replace(/(<style\b[^>]*>)[\s\S]*?(<\/style>)/gi, "$1$2");
  if (!/<html\b[^>]*\blang=["']ru["']/i.test(markup)) report(file, "не задан lang=\"ru\"");
  if (!/<title>\s*[^<]+\s*<\/title>/i.test(markup)) report(file, "нет непустого title");
  if (!/<meta\b[^>]*\bname=["']viewport["'][^>]*>/i.test(markup)) report(file, "нет viewport");
  if (!/<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["'][^"']+["'][^>]*>/i.test(markup)
      && !/<meta\b[^>]*\bcontent=["'][^"']+["'][^>]*\bname=["']description["'][^>]*>/i.test(markup)) {
    report(file, "нет meta description");
  }
  if (!/<h1\b[^>]*>/i.test(markup)) report(file, "нет заголовка h1");
  if (/\{\{[^{}]+\}\}/.test(html)) report(file, "остался незаполненный шаблон {{...}}");
  if (html.includes("�")) report(file, "обнаружен символ повреждённой кодировки �");

  const title = markup.match(/<title>\s*([^<]+?)\s*<\/title>/i)?.[1];
  if (title) titles.set(title, [...(titles.get(title) ?? []), file]);
  const descriptionTag = [...markup.matchAll(/<meta\b[^>]*>/gi)]
    .find((match) => attribute(match[0], "name")?.toLocaleLowerCase() === "description")?.[0];
  const description = descriptionTag ? attribute(descriptionTag, "content") : null;
  if (description) descriptions.set(description, [...(descriptions.get(description) ?? []), file]);
  const noindex = [...markup.matchAll(/<meta\b[^>]*>/gi)].some((match) =>
    attribute(match[0], "name")?.toLocaleLowerCase() === "robots"
    && (attribute(match[0], "content") ?? "").toLocaleLowerCase().split(/\s*,\s*/).includes("noindex")
  );
  if (!noindex) {
    if (!/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']https:\/\/[^"']+["'][^>]*>/i.test(markup)
        && !/<link\b[^>]*\bhref=["']https:\/\/[^"']+["'][^>]*\brel=["']canonical["'][^>]*>/i.test(markup)) {
      report(file, "нет абсолютного canonical URL");
    }
    for (const property of ["og:title", "og:description", "og:url"]) {
      const present = [...markup.matchAll(/<meta\b[^>]*>/gi)].some((match) =>
        attribute(match[0], "property")?.toLocaleLowerCase() === property && attribute(match[0], "content")
      );
      if (!present) report(file, `нет метатега ${property}`);
    }
  }

  const ids = new Set();
  for (const match of markup.matchAll(/\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)) {
    const id = match[1] ?? match[2];
    if (ids.has(id)) report(file, `повторяется id=\"${id}\"`);
    ids.add(id);
  }

  for (const match of markup.matchAll(/<img\b[^>]*>/gi)) {
    if (attribute(match[0], "alt") === null) report(file, `у изображения нет alt: ${match[0].slice(0, 100)}`);
  }

  for (const match of markup.matchAll(/<button\b[^>]*>/gi)) {
    if (attribute(match[0], "type") === null) report(file, `у кнопки не задан type: ${match[0].slice(0, 100)}`);
  }

  for (const match of markup.matchAll(/<a\b[^>]*>/gi)) {
    if (attribute(match[0], "target") !== "_blank") continue;
    const rel = (attribute(match[0], "rel") ?? "").split(/\s+/);
    if (!rel.includes("noopener")) report(file, "ссылка target=\"_blank\" не содержит rel=\"noopener\"");
  }

  for (const match of markup.matchAll(/<(?:a|img|script|link)\b[^>]*>/gi)) {
    const raw = attribute(match[0], match[0].startsWith("<a") || match[0].startsWith("<link") ? "href" : "src");
    if (!raw) continue;
    const url = decodeUrl(raw).split("#", 1)[0].split("?", 1)[0];
    if (!url || /^(?:[a-z]+:|\/\/)/i.test(url)) continue;
    let decoded;
    try {
      decoded = decodeURIComponent(url);
    } catch {
      report(file, `некорректная URL-кодировка: ${raw}`);
      continue;
    }
    const candidate = decoded.startsWith("/")
      ? path.join(dist, decoded.replace(/^\/+/, ""))
      : path.resolve(path.dirname(file), decoded);
    const target = path.extname(candidate) ? candidate : path.join(candidate, "index.html");
    if (!await pathExists(target)) report(file, `не найден локальный ресурс: ${raw}`);
  }
}

for (const [title, titleFiles] of titles) {
  if (titleFiles.length > 1) report(titleFiles[0], `title повторяется на ${titleFiles.length} страницах: ${title}`);
}
for (const [description, descriptionFiles] of descriptions) {
  if (descriptionFiles.length > 1) {
    report(descriptionFiles[0], `meta description повторяется на ${descriptionFiles.length} страницах: ${description}`);
  }
}

if (errors.length) {
  console.error(`Аудит публикации обнаружил ошибок: ${errors.length}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Аудит публикации пройден: ${htmlFiles.length} HTML-страниц, локальные ссылки и базовая разметка исправны.`);
}
