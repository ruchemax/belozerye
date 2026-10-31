import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { books, fragments, places, mentions, locations, churches, churchSources, bookDocuments } from "./load-database.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const siteUrl = "https://belozersky.uezd.workers.dev";

const template = await readFile(path.join(root, "templates/place-page.html"), "utf8");
const homeTemplate = await readFile(path.join(root, "templates/home-page.html"), "utf8");
const mapPageTemplate = await readFile(path.join(root, "templates/map-page.html"), "utf8");
const mapMarkerSettings = await readFile(path.join(root, "templates/map-marker-settings.js"), "utf8");
const notFoundTemplate = await readFile(path.join(root, "templates/not-found.html"), "utf8");
const responseHeaders = await readFile(path.join(root, "templates/headers.txt"), "utf8");
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const decodeHtml = (value) => String(value)
  .replaceAll("&nbsp;", " ")
  .replaceAll("&amp;", "&")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'");
const plainText = (value) => decodeHtml(String(value)
  .replace(/<span\b[^>]*class="[^"]*\bpage-mark\b[^"]*"[^>]*>[\s\S]*?<\/span>/giu, "")
  .replace(/<[^>]+>/gu, " ")
  .replace(/\s+/gu, " ")
  .trim());
const cleanFragmentHtml = (value) => String(value)
  .trim()
  .replace(/\sdata-astro-cid-[a-z0-9-]+(?:="[^"]*")?/giu, "")
  .replace(/^<div\b[^>]*class="[^"]*\bvillage-lines\b[^"]*"[^>]*>([\s\S]*?)<\/div>$/iu, "$1")
  .replace(/<div\b[^>]*class="[^"]*\brecord-body\b[^"]*"[^>]*>([\s\S]*?)<\/div>/giu, "$1")
  .trim();
const byId = (items, label) => {
  const result = new Map();
  for (const item of items) {
    if (!item.id || result.has(item.id)) throw new Error(`Некорректный или повторяющийся ID в ${label}: ${item.id}`);
    result.set(item.id, item);
  }
  return result;
};

const booksById = byId(books, "books.json");
const fragmentsById = byId(fragments, "fragments.json");
const placesById = byId(places, "places.json");
const churchSourcesByChurchId = new Map();
for (const source of churchSources) {
  const sources = churchSourcesByChurchId.get(source.church_id) ?? [];
  sources.push(source);
  churchSourcesByChurchId.set(source.church_id, sources);
}
const churchesByLocationPlaceId = new Map();
for (const church of churches) {
  if (!church.location_place_id) continue;
  const linkedChurches = churchesByLocationPlaceId.get(church.location_place_id) ?? [];
  linkedChurches.push(church);
  churchesByLocationPlaceId.set(church.location_place_id, linkedChurches);
}
byId(mentions, "mentions.json");

for (const book of books) {
  if (!book.slug || !book.full_title || !book.short_title || !book.year) throw new Error(`В книге ${book.id} не заполнены slug, full_title, short_title или year.`);
}

if (locations.type !== "FeatureCollection" || !Array.isArray(locations.features)) {
  throw new Error("locations.geojson должен быть коллекцией FeatureCollection.");
}

for (const fragment of fragments) {
  if (!booksById.has(fragment.book_id)) throw new Error(`Фрагмент ${fragment.id} ссылается на неизвестную книгу.`);
}

const bookHtmlByPath = new Map();
const mentionsByFragment = new Map();
const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");
const bookLayoutStyle = `<style id="book-layout-style">
.document-body {
  /* Shared book rhythm. Change these values once to update every book. */
  --book-h1-margin-before: 1rem;
  --book-h1-margin-after: .5rem;
  --book-h1-indent: 0rem;
  --book-h2-margin-before: 1rem;
  --book-h2-margin-after: .5rem;
  --book-h2-indent: 1rem;
  --book-h3-margin-before: 2.25rem;
  --book-h3-margin-after: .85rem;
  --book-h3-indent: 2rem;
  --book-prose-margin-before: .5rem;
  --book-prose-margin-after: 0rem;
  --book-prose-indent: 2rem;
}
.document-body h1:not(.place-heading) {
  margin-block: var(--book-h1-margin-before) var(--book-h1-margin-after) !important;
  margin-inline: var(--book-h1-indent) 0 !important;
}
.document-body h2:not(.place-heading) {
  margin-block: var(--book-h2-margin-before) var(--book-h2-margin-after) !important;
  margin-inline: var(--book-h2-indent) 0 !important;
}
.document-body h3:not(.place-heading) {
  margin-block: var(--book-h3-margin-before) var(--book-h3-margin-after) !important;
  margin-inline: var(--book-h3-indent) 0 !important;
}
.document-body :is(h1, h2, h3):not(.place-heading) > .heading-toggle {
  position: static;
  margin: 0 .3rem 0 0;
}
.document-body .heading-row {
  margin-block: var(--book-h2-margin-before) var(--book-h2-margin-after) !important;
  margin-inline: var(--book-h2-indent) 0 !important;
}
.document-body .heading-row h2 {
  margin: 0 !important;
}
.document-body a[href*="/churches/"] {
  text-decoration: none;
}
.document-body a[href*="/churches/"]:hover,
.document-body a[href*="/churches/"]:focus-visible,
.document-body .church-fragment-link:hover,
.document-body .church-fragment-link:focus-visible {
  text-decoration: underline;
  text-decoration-color: #9a3412;
  text-underline-offset: .14em;
}
.document-body .record,
.document-body .place-record {
  margin: 1rem 0 0 !important;
  padding-left: var(--book-prose-indent) !important;
  line-height: 1.65 !important;
  text-align: justify !important;
}
.document-body :is(.record, .place-record) :is(.record, .place-record) {
  padding-left: 0 !important;
}
.document-body .record-body,
.document-body .village-lines { margin: 0 !important; padding: 0 !important; }
.document-body .record-prose,
.document-body .record-body > p,
.document-body .place-record > p {
  margin-block: var(--book-prose-margin-before) var(--book-prose-margin-after) !important;
  margin-inline: 0 !important;
  padding: 0 !important;
  text-indent: 0 !important;
  line-height: 1.65 !important;
  text-align: justify !important;
}
.document-body :is(.record, .place-record) h1:not(.place-heading) {
  margin-inline-start: calc(var(--book-h1-indent) - var(--book-prose-indent)) !important;
}
.document-body :is(.record, .place-record) h2:not(.place-heading) {
  margin-inline-start: calc(var(--book-h2-indent) - var(--book-prose-indent)) !important;
}
.document-body :is(.record, .place-record) h3:not(.place-heading) {
  margin-inline-start: calc(var(--book-h3-indent) - var(--book-prose-indent)) !important;
}
.document-body .church-source-fragment > .church-source-lead,
.document-body .church-source-fragment > .closing-church {
  padding: 0 !important;
  text-align: justify !important;
  text-indent: 0 !important;
  color: #33281f !important;
  font-size: .9375rem !important;
  font-weight: 400 !important;
  line-height: 1.65 !important;
}
.document-body .church-source-fragment > .church-source-lead {
  margin: 0 !important;
}
.document-body .church-source-fragment > .closing-church {
  margin: .5rem 0 0 !important;
}
.document-body .church-source-fragment > .church-source-lead a {
  color: #9a3412 !important;
  font-weight: 600 !important;
  font-style: italic;
}
/* Keep the contents rhythm identical across books with different source CSS. */
.contents-heading {
  margin: 0 0 1rem !important;
  line-height: 1.25 !important;
}
#document-contents,
#document-contents .toc-children {
  display: grid !important;
  grid-auto-rows: max-content !important;
  row-gap: 0 !important;
  margin: 0 !important;
  padding-block: 0 !important;
}
#document-contents .contents-entry {
  display: flex !important;
  min-height: 0 !important;
  margin: 0 0 .35rem !important;
  padding-block: 0 !important;
  line-height: 1.5 !important;
}
#document-contents .contents-entry > * { margin-block: 0 !important; }
#document-contents .contents-level-2 { padding-left: 1rem !important; }
#document-contents .contents-level-3 { padding-left: 2rem !important; }
#document-contents .contents-entry.contents-level-1 {
  margin-top: 0 !important;
}
</style>`;
const churchHighlightStyle = `<style id="church-name-highlight-style">
.church-name-highlight {
  color: #9a3412;
  font-weight: 600;
  font-style: italic;
  text-underline-offset: .12em;
}
.document-body #church-and-estates {
  display: inline;
  white-space: normal !important;
  overflow-wrap: anywhere;
}
.document-body #church-and-estates + .church-description {
  display: inline;
  margin: 0;
  padding: 0;
  color: #33281f;
  font-size: inherit;
  font-weight: 400;
  line-height: inherit;
}
/* Primary headings outside a record keep the same safe inset as the first heading. */
.document-body > h1.primary-section-heading {
  margin-inline-start: var(--book-prose-indent) !important;
}
.document-body #krushkova-record {
  display: inline;
  margin: 0;
  padding: 0;
}
.document-body #krushkova-record::after { content: " "; }
.document-body #vacant-lands {
  display: inline;
  padding: 0;
}
.document-body #vacant-lands::after { content: " "; }
.document-body .heading-row:has(+ #belozersky-1626-fragment-staraya),
.document-body #belozersky-1626-fragment-staraya {
  display: contents;
}
.document-body .heading-row:has(+ #belozersky-1626-fragment-staraya) .heading-connector::after {
  content: " ";
}
.document-body .staraya-continuous-record {
  padding-left: var(--book-prose-indent);
  text-indent: calc(var(--book-h2-indent) - var(--book-prose-indent));
}
.document-body #belozersky-1626-fragment-staraya .village-lines > p:not(:first-child) {
  text-indent: 0;
}
.document-body .plain-heading-text {
  color: #33281f !important;
  font-size: 1rem;
  font-weight: 400;
}
.document-body #church-lands-luzhkovo .place-title-link { color: #9a3412 !important; }
.document-body #belozersky-1626-fragment-church-lands-luzhkovo {
  margin-left: 0 !important;
  padding-left: 0 !important;
  text-align: justify !important;
}
.document-body #church-lands-luzhkovo { margin-left: 0 !important; }
.document-body #belozersky-1626-fragment-church-lands-luzhkovo > p { text-align: justify !important; }
.document-body h3#nativity-church { font-size: .9375rem !important; }
.document-body { text-align: justify !important; }
.book-full-title { margin: 0 0 1rem; color: #33281f; font-size: .9375rem; line-height: 1.5; text-align: justify; }
.book-bibliography { margin: 0 0 1rem; color: #000; font-size: .875rem; line-height: 1.625; text-align: justify; }
.book-bibliography .book-reference { margin: 0 0 .5rem; color: #000 !important; }
.book-reference-label { color: #000; font-weight: 600; }
.book-bibliography a { color: #000 !important; text-decoration: none; }
.book-bibliography a:hover { text-decoration: underline; text-underline-offset: 2px; }
</style>`;
const churchHighlightScript = `<script id="church-name-highlight-script">
(() => {
  const root = document.querySelector(".document-body");
  if (!root) return;
  const starayaSection = document.getElementById("belozersky-1626-fragment-staraya");
  const starayaHeadingRow = starayaSection?.previousElementSibling;
  if (starayaHeadingRow?.classList.contains("heading-row")) {
    const continuousRecord = document.createElement("div");
    continuousRecord.className = "staraya-continuous-record";
    starayaHeadingRow.before(continuousRecord);
    continuousRecord.append(starayaHeadingRow, starayaSection);
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      return parent && !parent.closest("script, style, .church-name-highlight") && /(?<!\\p{L})церковь(?=[^\\p{L}]|$)/iu.test(node.nodeValue)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const text = node.nodeValue;
    const expression = /(?<!\\p{L})церковь(?=[^\\p{L}]|$)[^,.]{0,180}/giu;
    let match;
    let cursor = 0;
    const fragment = document.createDocumentFragment();
    while ((match = expression.exec(text))) {
      fragment.append(text.slice(cursor, match.index));
      const highlight = document.createElement("span");
      highlight.className = "church-name-highlight";
      highlight.textContent = match[0].trimEnd();
      fragment.append(highlight, match[0].slice(highlight.textContent.length));
      cursor = expression.lastIndex;
    }
    if (cursor > 0) {
      fragment.append(text.slice(cursor));
      node.replaceWith(fragment);
    }
  }
})();
</script>`;
const addBookLayout = (html) => html.includes('id="book-layout-style"')
  ? html.replace(/<style id="book-layout-style">[\s\S]*?<\/style>/u, bookLayoutStyle)
  : html.replace("</head>", `${bookLayoutStyle}</head>`);
const addChurchHighlighting = (html) => {
  let result = html;
  if (result.includes('id="church-name-highlight-style"')) {
    result = result.replace(/<style id="church-name-highlight-style">[\s\S]*?<\/style>/u, churchHighlightStyle);
  } else {
    result = result.replace("</head>", `${churchHighlightStyle}</head>`);
  }
  if (result.includes('id="church-name-highlight-script"')) {
    result = result.replace(/<script id="church-name-highlight-script">[\s\S]*?<\/script>/u, churchHighlightScript);
  } else {
    result = result.replace("</body>", `${churchHighlightScript}</body>`);
  }
  return result;
};
const applyBookTitles = (html, book) => {
  const heading = new RegExp(`<h1\\b([^>]*)>\\s*${escapeRegex(book.full_title)}\\s*<\\/h1>`, "u");
  const fallbackHeading = /<h1\b([^>]*)\bclass="([^"]*\btext-2xl\b[^"]*)"([^>]*)>[\s\S]*?<\/h1>/u;
  let headingMatch = heading.exec(html);
  let headingAttributes;
  if (headingMatch) headingAttributes = headingMatch[1];
  else {
    headingMatch = fallbackHeading.exec(html);
    if (headingMatch) headingAttributes = `${headingMatch[1]}class="${headingMatch[2]}"${headingMatch[3]}`;
  }
  if (!headingMatch) throw new Error(`Main heading for book ${book.id} was not found.`);

  const publicationDatePattern = /<p\b[^>]*>\s*Опубликовано:[\s\S]*?<\/p>/iu;
  const publicationDate = publicationDatePattern.exec(html)?.[0] ?? "";
  const publicationUrl = /<p\b[^>]*>\s*Публикация:\s*<a\b[^>]*href="([^"]+)"/iu.exec(html)?.[1];
  let beforeHeading = html.slice(0, headingMatch.index).replace(publicationDatePattern, "");
  let afterHeading = html.slice(headingMatch.index + headingMatch[0].length);
  afterHeading = afterHeading
    .replace(/^\s*<p\b[^>]*class="[^"]*\bbook-full-title\b[^"]*"[^>]*>[\s\S]*?<\/p>/u, "")
    .replace(/^\s*<div\b[^>]*class="[^"]*\bspace-y-3\b[^"]*"[^>]*>[\s\S]*?<\/div>/u, "");

  const archiveReference = book.archive_reference ? escapeHtml(book.archive_reference) : "";
  const publicationText = book.publication_reference ? escapeHtml(book.publication_reference) : "";
  const publicationReference = publicationUrl && book.publication_reference
    ? `<a href="${escapeHtml(publicationUrl)}" rel="noopener noreferrer" target="_blank">${publicationText}</a>`
    : publicationText;
  const metadata = `${publicationDate ? `${publicationDate}\n` : ""}<h1${headingAttributes}>${escapeHtml(book.short_title)}</h1>
<p class="book-full-title">${escapeHtml(book.full_title)}</p>
${archiveReference || publicationReference ? `<div class="book-bibliography">
  ${archiveReference ? `<p class="book-reference"><span class="book-reference-label">Архивный шифр:</span> ${archiveReference}</p>` : ""}
  ${publicationReference ? `<p class="book-reference"><span class="book-reference-label">Публикации:</span><br>${publicationReference}</p>` : ""}
</div>` : ""}`;
  let result = `${beforeHeading}${metadata}${afterHeading}`;
  return result.replace(/<title>[\s\S]*?<\/title>/u, `<title>${escapeHtml(book.short_title)} — Белозерье</title>`);
};
const embeddedBookStyle = `<style id="embedded-book-style">
body.embedded-book > header,
body.embedded-book > footer { display: none !important; }
html:has(body.embedded-book),
body.embedded-book { min-height: 0 !important; background: transparent !important; scroll-behavior: auto !important; }
/* Scale all rem-based fragment typography uniformly relative to the book page. */
html:has(body.embedded-book) { font-size: 96% !important; }
body.embedded-book main { min-height: 0 !important; }
body.embedded-book .parchment-shell { padding: 0 !important; }
body.embedded-book .bound-parchment:before,
body.embedded-book .bound-parchment:after,
body.embedded-book .paper-bottom-edge { display: none !important; }
body.embedded-book .bound-parchment {
  padding: 0 calc(2.1rem) 0 1.35rem !important;
  background: transparent !important;
}
body.embedded-book .document-body {
  max-width: none !important;
  margin: 0 !important;
}
html:has(body.embedded-book) { scroll-padding-top: 0 !important; }
body.embedded-book [id] { scroll-margin-top: 0 !important; }
</style>`;
const addEmbeddedBookMode = (html) => {
  let result = html.includes('id="embedded-book-style"')
    ? html.replace(/<style id="embedded-book-style">[\s\S]*?<\/style>/u, embeddedBookStyle)
    : html.replace("</head>", `${embeddedBookStyle}</head>`);
const script = `<script id="embedded-book-script">if (new URLSearchParams(location.search).get("embed") === "1") { document.body.classList.add("embedded-book"); const parameters = new URLSearchParams(location.search); const targetId = decodeURIComponent(location.hash.slice(1)); const endId = parameters.get("end") || targetId; const target = () => document.getElementById(targetId); const fragment = () => target()?.closest("section.place-record, section.record"); const ownHeading = (element) => element?.matches("h1,h2,h3,h4,h5,h6") ? element : element?.querySelector(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6") ?? element; const fragmentHeight = () => { const targetElement = target(); const endElement = document.getElementById(endId); const anchor = ownHeading(targetElement); const endAnchor = ownHeading(endElement); const record = endElement?.closest("section.place-record, section.record"); if (!targetElement || !anchor || !endAnchor || !record) return 0; const headings = [...record.querySelectorAll("h1,h2,h3,h4,h5,h6")]; const nextHeading = headings.slice(headings.indexOf(endAnchor) + 1).find((heading) => heading.classList.contains("place-heading")); const boundary = nextHeading?.getBoundingClientRect().top; let bottom = anchor.getBoundingClientRect().bottom; for (const element of record.querySelectorAll("*")) { const rect = element.getBoundingClientRect(); if (boundary !== undefined && rect.top >= boundary) continue; bottom = Math.max(bottom, rect.bottom); } return bottom - targetElement.getBoundingClientRect().top + 2; }; const scrollToAnchor = () => { const element = target(); if (element) scrollTo(0, scrollY + element.getBoundingClientRect().top); }; const replaceFragmentLinks = () => document.querySelectorAll(".place-title-link, a[href*='/churches/']").forEach((link) => { const churchLink = link.matches("a[href*='/churches/']"); const record = link.closest("section.place-record, section.record"); if (!record?.id) return; if (churchLink) link.classList.add("church-fragment-link"); link.href = location.pathname + "#" + encodeURIComponent(record.id); link.target = "_top"; }); const reportFragmentHeight = () => { const height = fragmentHeight(); if (height > 0) parent.postMessage({ type: "belozerye-source-fragment", anchor: targetId, endAnchor: endId, height: Math.ceil(height) }, location.origin); }; addEventListener("load", () => { replaceFragmentLinks(); setTimeout(() => { scrollToAnchor(); reportFragmentHeight(); }, 150); setTimeout(() => { scrollToAnchor(); reportFragmentHeight(); }, 500); }); }</script>`;
  if (!result.includes('id="embedded-book-script"')) {
    result = result.replace(/<body\b[^>]*>/iu, (opening) => `${opening}${script}`);
  }
  return result;
};
for (const mention of mentions) {
  const fragmentMentions = mentionsByFragment.get(mention.fragment_id) ?? [];
  fragmentMentions.push(mention);
  mentionsByFragment.set(mention.fragment_id, fragmentMentions);
}

const extractFragmentFromBook = (html, fragment, book) => {
  const sectionIdMatch = new RegExp(`\\bid="(?:${escapeRegex(fragment.id)}|${escapeRegex(fragment.source_heading_id)})"`, "iu").exec(html);
  const headingPattern = new RegExp(`<h([123])\\b[^>]*\\bid="${escapeRegex(fragment.source_heading_id)}"[^>]*>[\\s\\S]*?<\\/h\\1>`, "iu");
  const initialHeadingMatch = headingPattern.exec(html);
  const markerIndex = sectionIdMatch?.index ?? initialHeadingMatch?.index ?? -1;
  const sectionStart = markerIndex === -1 ? -1 : html.lastIndexOf("<section", markerIndex);
  const sectionOpenEnd = sectionStart === -1 ? -1 : html.indexOf(">", sectionStart);
  const sectionCloseStart = sectionOpenEnd === -1 ? -1 : html.indexOf("</section>", sectionOpenEnd);
  if (sectionStart === -1 || sectionOpenEnd === -1 || sectionCloseStart === -1) {
    throw new Error(`Не найден раздел фрагмента ${fragment.id} в книге ${book.id}.`);
  }

  const sectionOpening = html.slice(sectionStart, sectionOpenEnd + 1);
  if (!/class="[^"]*\b(?:place-record|record)\b[^"]*"/iu.test(sectionOpening)) {
    throw new Error(`Фрагмент ${fragment.id} находится вне раздела записи.`);
  }

  const sectionBody = html.slice(sectionOpenEnd + 1, sectionCloseStart);
  const headingMatch = headingPattern.exec(sectionBody)
    ?? /<h([123])\b[^>]*class="[^"]*\b(?:place-heading|record-title)\b[^"]*"[^>]*>[\s\S]*?<\/h\1>/iu.exec(sectionBody);
  if (!headingMatch) {
    throw new Error(`Не найден исходный заголовок ${fragment.source_heading_id} для фрагмента ${fragment.id}.`);
  }

  const headingOpenEnd = headingMatch[0].indexOf(">");
  const headingCloseStart = headingMatch[0].lastIndexOf("</h");
  const headingHtml = headingMatch[0].slice(headingOpenEnd + 1, headingCloseStart);
  const inlineDescription = /<span\b[^>]*\bclass="[^"]*\bchurch-description\b[^"]*"[^>]*>[\s\S]*?<\/span>/iu.exec(headingHtml);
  const headingText = plainText(inlineDescription ? headingHtml.replace(inlineDescription[0], "") : headingHtml);
  let punctuation = /[,.]$/u.exec(headingText)?.[0] ?? ",";
  const sourceName = fragment.source_name_override
    ?? headingText.replace(/[,.]$/u, "").trim();
  const afterHeadingIndex = headingMatch.index + headingMatch[0].length;
  const headingLineStart = sectionBody.lastIndexOf("<div", headingMatch.index);
  const headingLineOpenEnd = headingLineStart === -1 ? -1 : sectionBody.indexOf(">", headingLineStart);
  const headingLineOpening = headingLineOpenEnd === -1 ? "" : sectionBody.slice(headingLineStart, headingLineOpenEnd + 1);
  const headingLineClose = /class="[^"]*\brecord-heading-line\b[^"]*"/iu.test(headingLineOpening)
    ? sectionBody.indexOf("</div>", afterHeadingIndex)
    : -1;
  let fragmentSource = headingLineClose === -1
    ? sectionBody.slice(afterHeadingIndex)
    : sectionBody.slice(afterHeadingIndex, headingLineClose) + sectionBody.slice(headingLineClose + 6);
  if (inlineDescription) fragmentSource = inlineDescription[0];
  if (fragment.following_only) fragmentSource = "";
  if (fragment.include_following_class) {
    const followingHtml = html.slice(sectionCloseStart + "</section>".length);
    const followingPattern = new RegExp(
      `^\\s*(<([a-z][a-z0-9]*)\\b[^>]*class="[^"]*\\b${escapeRegex(fragment.include_following_class)}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/\\2>)`,
      "iu"
    );
    let remainder = followingHtml;
    while (true) {
      const followingMatch = followingPattern.exec(remainder);
      if (!followingMatch) break;
      fragmentSource += `\n${followingMatch[1]}`;
      remainder = remainder.slice(followingMatch[0].length);
    }
  }
  if (fragment.exclude_nested_sections) {
    fragmentSource = fragmentSource
      .replace(/^\s*<div\b[^>]*class="[^"]*\bvillage-lines\b[^"]*"[^>]*>/iu, "")
      .replace(/<section\b[\s\S]*$/iu, "")
      .trim();
  }
  if (fragment.content_class) {
    const contentPattern = new RegExp(
      `<([a-z][a-z0-9]*)\\b[^>]*class="[^"]*\\b${escapeRegex(fragment.content_class)}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/\\1>`,
      "iu"
    );
    const contentMatch = contentPattern.exec(sectionBody);
    if (!contentMatch) {
      throw new Error(`Не найден блок .${fragment.content_class} для фрагмента ${fragment.id}.`);
    }
    fragmentSource = contentMatch[0];
  }
  if (/^[,.]/u.test(plainText(fragmentSource))) punctuation = "";
  if (fragment.source_punctuation_override !== undefined) {
    punctuation = fragment.source_punctuation_override;
  }
  const fragmentHtml = cleanFragmentHtml(fragmentSource);
  const headingAbsoluteEnd = sectionOpenEnd + 1 + headingMatch.index + headingMatch[0].length;
  const folioMarks = [...html.slice(0, headingAbsoluteEnd).matchAll(
    /<span\b[^>]*class="[^"]*\bpage-mark\b[^"]*"[^>]*>\(л\.\s*([^)]+)\)<\/span>/giu
  )];
  const folio = decodeHtml(folioMarks.at(-1)?.[1]?.trim() ?? fragment.folio)
    .replace(/\s+(об\.)$/iu, "$1");

  if (!sourceName || (!fragmentHtml && !fragment.allow_empty)) {
    throw new Error(`Не удалось извлечь текст фрагмента ${fragment.id} из книги ${book.id}.`);
  }
  return { sourceName, punctuation, fragmentHtml, folio };
};
const addContentFragmentAnchor = (html, fragment) => {
  if (!fragment.content_class || html.includes(`id="${fragment.id}"`)) return html;
  const pattern = new RegExp(
    `(<section\\b[^>]*\\bid="${escapeRegex(fragment.source_heading_id)}"[^>]*>[\\s\\S]*?<([a-z][a-z0-9]*)\\b)([^>]*\\bclass="[^"]*\\b${escapeRegex(fragment.content_class)}\\b[^"]*"[^>]*)>`,
    "iu"
  );
  return html.replace(pattern, `$1 id="${fragment.id}"$3>`);
};

for (const book of books) {
  const bookPath = path.join(root, "dist", "books", book.slug, "index.html");
  let html = bookDocuments.get(book.id);
  if (!html) throw new Error(`В базе нет текста книги ${book.id}. Пересоздайте базу данных.`);
  if (book.id === "belozersky-1626") {
    html = html.replace(
      '<h1 id="church-and-estates" class="primary-section-heading"',
      '<section id="belozersky-1626-fragment-state-churchyard" class="church-record place-record" data-astro-cid-zcak6nys><h1 id="church-and-estates" class="primary-section-heading place-heading"'
    );
    html = html.replace(
      '</p><section id="belozersky-1626-fragment-001"',
      '</p></section><section id="belozersky-1626-fragment-001"'
    );
    html = html.replace(
      '</h1><section id="belozersky-1626-fragment-001"',
      '</h1></section><section id="belozersky-1626-fragment-001"'
    );
    html = html.replace(/Починок Кощеив(?! \[Кощеев\])/gu, "Починок Кощеив [Кощеев]");
    html = html.replaceAll(
      "Да Устюговские волости",
      "Да Устюговские [Усть-Угольской] волости"
    );
    html = html.replaceAll(
      "Деревня Борисовска на ручье",
      "Деревня Борисовска[я] на ручье"
    );
    html = html.replaceAll("Новцо Давыдово", "новцо Давыдово");
    html = html.replace(
      /(<h3\b[^>]*\bid="church-lands-luzhkovo"[^>]*>\s*<span)(?![^>]*\bplain-heading-text\b)([^>]*>Да церковные земли в<\/span>)/u,
      '$1 class="plain-heading-text"$2'
    );
  }
  if (book.id === "belozersky-1544") {
    html = html.replace(/<div class="contents-entry contents-level-3"[^>]*><a class="contents-link"[^>]*href="#nativity-church">[^<]*<\/a><\/div>/u, "");
    html = html.replaceAll(
      /Починок Дроздове(?! \[Дроздово\])/gu,
      "Починок Дроздове [Дроздово]"
    );
    html = html.replace(
      /(<h3\b[^>]*\bid="nativity-church"[^>]*>)(?!<span class="heading-inline-prose">)На монастырской же земле\s+/u,
      '$1<span class="heading-inline-prose">На монастырской же земле </span>'
    );
  }
  if (book.id === "belozersky-1585") {
    html = html.replace(
      /(А на погосте )церковь Богоявление\s*(<span class="page-mark"[^>]*>\(л\. 1544об\.\)<\/span>)(\s*Господа нашего Иисуса Христа)/u,
      '$1<span class="church-name-highlight">церковь Богоявление</span> $2<span class="church-name-highlight">$3</span>'
    );
    html = html.replace(
      /(А на погосте )(<a href="[^"]*\/churches\/bogoyavlenie-ugol\/">церковь Богоявление\s*<span class="page-mark"[^>]*>\(л\. 1544об\.\)<\/span>\s*Господа нашего Иисуса Христа<\/a>)/u,
      '$1<span class="church-name-highlight">$2</span>'
    );
    html = html.replace(
      /(а другая )церковь страстотерпца Христова Георгия(?= древяная)/u,
      '$1<span class="church-name-highlight">церковь страстотерпца Христова Георгия</span>'
    );
  }
  html = addEmbeddedBookMode(addChurchHighlighting(addBookLayout(applyBookTitles(html, book))));
  for (const fragment of fragments.filter((item) => item.book_id === book.id)) {
    if (fragment.church_source_only) continue;
    const extracted = extractFragmentFromBook(html, fragment, book);
    fragment.html = extracted.fragmentHtml;
    fragment.folio = extracted.folio;
    for (const mention of mentionsByFragment.get(fragment.id) ?? []) {
      mention.source_name = extracted.sourceName;
      mention.source_punctuation = extracted.punctuation;
    }
    html = addContentFragmentAnchor(html, fragment);
  }
  if (book.id === "belozersky-1544" && !html.includes('id="belozersky-1544-nativity-church"')) {
    html = html.replace(
      /<h3\b[^>]*\bid="nativity-church"[^>]*>([\s\S]*?)<\/h3>/u,
      '<p class="church-source-lead" id="nativity-church">$1</p>'
    );
    const nativityChurchPattern = /(<p\b[^>]*\bid="nativity-church"[^>]*>[\s\S]*?<\/p>\s*<p\b[^>]*\bclass="[^"]*\bclosing-church\b[^"]*"[^>]*>[\s\S]*?<\/p>)/u;
    if (!nativityChurchPattern.test(html)) {
      throw new Error("Не найден фрагмент церкви Рождества Богородицы в книге 1544 года.");
    }
    html = html.replace(
      nativityChurchPattern,
      '<section class="record church-source-fragment" id="belozersky-1544-nativity-church">$1</section>'
    );
  }
  bookHtmlByPath.set(bookPath, html);
}

for (const mention of mentions) {
  if (!placesById.has(mention.place_id)) throw new Error(`Упоминание ${mention.id} ссылается на неизвестное поселение.`);
  if (!fragmentsById.has(mention.fragment_id)) throw new Error(`Упоминание ${mention.id} ссылается на неизвестный фрагмент.`);
  if (!mention.source_name) throw new Error(`В упоминании ${mention.id} не заполнено название из источника.`);
  for (const field of ["uezd", "volost"]) {
    if (!mention.source_context?.[field]) throw new Error(`В упоминании ${mention.id} не заполнено поле source_context.${field}.`);
  }
  const landCategories = mention.source_context?.land_categories ?? [mention.source_context?.land_category];
  if (landCategories.length === 0 || landCategories.some((category) => !category?.label)) {
    throw new Error(`В упоминании ${mention.id} не заполнена категория земли.`);
  }
}

const sourceYearValue = (year) => {
  const label = String(year).trim();
  const match = label.match(/\d{4}/u);
  if (!match) return Number.NEGATIVE_INFINITY;
  const value = Number(match[0]);
  return /^до\s+/iu.test(label) ? value - .5 : value;
};
const latestMentionForPlace = (place) => mentions
  .filter((mention) => mention.place_id === place.id)
  .reduce((latest, mention) => {
    if (!latest) return mention;
    const mentionBook = booksById.get(fragmentsById.get(mention.fragment_id).book_id);
    const latestBook = booksById.get(fragmentsById.get(latest.fragment_id).book_id);
    return sourceYearValue(mentionBook.year) > sourceYearValue(latestBook.year) ? mention : latest;
  }, null);
const placeTypePattern = "(?:деревня|деревни|полдеревни|полдеревня|пустошь|пустоши|пустош|селище|селища|починок|новцо|займище)";
const bareRiverLocationPattern = "(?:Шехсне|Уломе)";
const normalizedPlaceName = (sourceName) => {
  let name = String(sourceName).trim();
  name = name.replace(/^\[([^\]]+)\]/u, "$1");
  name = name.replace(
    new RegExp(`^(${placeTypePattern})\\s*,?\\s+что\\s+(?:была|было|был|были)\\s+${placeTypePattern}\\s+`, "iu"),
    "$1 "
  );
  name = name.replace(
    new RegExp(`,\\s*что\\s+(?:была|было|был|были)\\s+${placeTypePattern}\\s+[\\s\\S]*$`, "iu"),
    ""
  );
  name = name.replace(
    new RegExp(`^${placeTypePattern}(?=\\s)`, "iu"),
    (type) => type.toLocaleLowerCase("ru-RU")
  );
  name = name.replace(/\s+на\s+(?:реке|речке|ручье|ручью)(?=\s|$|[,.])[\s\S]*$/iu, "");
  name = name.replace(new RegExp(`\\s+на\\s+${bareRiverLocationPattern}(?=$|[,.])[\\s\\S]*$`, "iu"), "");
  name = name.replace(/\s+против(?=\s|$|[,.])[\s\S]*$/iu, "");
  name = name.replace(/\s+(?:на\s+)?пуст(?:а|ая|ое|ой|ои)(?=\s|$|[,.])[\s\S]*$/iu, "");
  return name.replace(/[,.\s]+$/u, "").trim();
};
const formerPlaceName = (sourceName) => {
  const name = String(sourceName).trim();
  const prefixMatch = new RegExp(
    `^${placeTypePattern}\\s*,?\\s+что\\s+(?:была|было|был|были)\\s+(${placeTypePattern})\\s+([\\s\\S]+)$`,
    "iu"
  ).exec(name);
  const suffixMatch = prefixMatch ? null : new RegExp(
    `^[\\s\\S]+?,\\s*что\\s+(?:была|было|был|были)\\s+(${placeTypePattern})\\s+([\\s\\S]+)$`,
    "iu"
  ).exec(name);
  const match = prefixMatch ?? suffixMatch;
  return match ? normalizedPlaceName(`${match[1]} ${match[2]}`) : "";
};
const placeNameWithoutType = (sourceName) => normalizedPlaceName(sourceName)
  .replace(new RegExp(`^${placeTypePattern}\\s+`, "iu"), "")
  .trim();
const separateHistoricalNames = (name) => {
  const value = String(name).trim();
  const match = /^(.*?),\s*(?:а\s+)?(?:зовут|называют)\s+(.+)$/iu.exec(value);
  if (!match) return [value];
  const first = match[1].trim();
  const second = match[2].trim();
  const type = new RegExp(`^(${placeTypePattern})\\s+`, "iu").exec(first)?.[1];
  return [first, type ? `${type} ${second}` : second];
};
const separateHistoricalState = (name, period) => {
  const value = String(name).trim();
  const formerMatch = new RegExp(
    `^(${placeTypePattern})\\s*,?\\s*что\\s+(?:было|была|был|были)\\s+(${placeTypePattern})\\s+(.+)$`,
    "iu"
  ).exec(value);
  if (formerMatch) {
    return [
      { label: `${formerMatch[2]} ${formerMatch[3]}`, period: `до ${period}` },
      { label: `${formerMatch[1]} ${formerMatch[3]}`, period }
    ];
  }
  return separateHistoricalNames(value).map((label) => ({ label, period }));
};
const primaryPlaceName = (sourceName) => placeNameWithoutType(sourceName)
  .replace(/,\s*[^,]+?\s+тож(?=$|[,.])/iu, "")
  .replace(/[,.\s]+$/u, "")
  .trim();
const mainPlaceName = (place) => {
  if (place.name) return place.name;
  if (Array.isArray(place.name_variants) && place.name_variants.length > 0) {
    return placeNameWithoutType(place.name_variants[0]);
  }
  const latestMention = latestMentionForPlace(place);
  return primaryPlaceName(latestMention?.historical_name_override ?? latestMention?.source_name);
};
const displayName = (place) => mainPlaceName(place);
const claimedPublicSlugs = new Set();
for (const place of places) {
  if (!place.slug || place.slug !== place.id) {
    throw new Error(`У поселения ${place.id} значения id и slug должны совпадать.`);
  }
  if (claimedPublicSlugs.has(place.slug)) throw new Error(`Повторяющийся URL поселения: ${place.slug}.`);
  claimedPublicSlugs.add(place.slug);
  place.legacy_slug = place.slug;
}
// Original texts may still contain old card URLs. They are retained only for
// compatibility with earlier site versions; the build always inserts the
// current human-readable URL.
for (const [bookPath, originalHtml] of bookHtmlByPath) {
  let html = originalHtml.replaceAll("../../belozerye-monastery-logo.svg", "../../images/icons/belozerye-monastery-logo.svg");
  for (const place of places) {
    if (place.legacy_slug === place.slug) continue;
    const oldHref = new RegExp(`(href="(?:\.\.\/)+places\/)${escapeRegex(place.legacy_slug)}(/(?:\")|[?#])`, "giu");
    html = html.replace(oldHref, `$1${place.slug}$2`);
  }
  bookHtmlByPath.set(bookPath, html);
}
const formatSubdivision = (subdivision) => ({
  "Чюравских": "Чуровские",
  "Судбицах": "Судбицы",
  "Чароме": "Чарома",
  "Тове": "Това"
}[subdivision] ?? subdivision);
const formatSourceContext = (context) => [
  `${context.uezd} уезд`,
  context.stan ? `${context.stan} стан` : null,
  context.prikaz ? `${context.prikaz} приказ` : null,
  context.volost_label ?? `${context.volost} волость`,
  formatSubdivision(context.subdivision) ?? null
].filter(Boolean).join(" · ");
const formatFolioMark = (folio) => `(л. ${folio.replace(/\s+(об\.)$/iu, "$1")})`;
const formatCoordinate = (value, positive, negative) => {
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60);
  const direction = (value >= 0 ? positive : negative).replaceAll(" ", "\u00a0");
  return `${degrees}°${minutes}′${seconds}″\u00a0${direction}`;
};
const renderMap = (placeLocation, fallbackLocation = null) => {
  const coordinates = placeLocation?.geometry?.type === "Point" ? placeLocation.geometry.coordinates : null;
  if (Array.isArray(coordinates) && coordinates.length >= 2 && coordinates.every(Number.isFinite)) {
    const [longitude, latitude] = coordinates;
    return {
      longitude,
      latitude,
      zoom: 14,
      coordinatesText: `${formatCoordinate(latitude, "с. ш.", "ю. ш.")}, ${formatCoordinate(longitude, "в. д.", "з. д.")}`,
      linkUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`,
      known: true
    };
  }
  const fallbackCoordinates = fallbackLocation?.geometry?.type === "Point"
    ? fallbackLocation.geometry.coordinates
    : null;
  const hasFallbackCoordinates = Array.isArray(fallbackCoordinates)
    && fallbackCoordinates.length >= 2
    && fallbackCoordinates.every(Number.isFinite);
  return {
    longitude: hasFallbackCoordinates ? fallbackCoordinates[0] : 38.1,
    latitude: hasFallbackCoordinates ? fallbackCoordinates[1] : 59.6,
    zoom: hasFallbackCoordinates ? 12 : 8,
    coordinatesText: "не установлены",
    known: false
  };
};
const locationIcon = `<svg
        class="location-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true">
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/>
        <circle cx="12" cy="10" r="2.5"/>
      </svg>`;
const placeLocationIcon = `<svg
        class="location-icon location-place-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5"/>
        <path d="M5 10.5h14V21H5z"/>
        <path d="M5 14.5h14M5 17.75h14M10 21v-5h4v5M8.5 10.5 12 7l3.5 3.5"/>
      </svg>`;
const renderPlaceMeta = (place, map, extraMeta = "", extraMetaFirst = false) => {
  const statusMeta = `    <!-- Status -->

    <div class="place-status">
      <span class="status-dot"></span>
      <div class="status-text">
        <span class="location-label">Статус</span>
        <span class="status-value">${escapeHtml(place.status.label)}</span>
      </div>
    </div>`;
  const coordinatesMeta = `    <!-- Coordinates -->

    <div class="place-location">

      ${locationIcon}

      <div class="location-text">

        <span class="location-label">
          Координаты
        </span>

        ${map.known ? `<a
          class="location-coordinates"
          href="${escapeHtml(map.linkUrl)}"
          target="_blank"
          rel="noopener noreferrer">
          ${escapeHtml(map.coordinatesText)}
        </a>` : `<span class="location-coordinates">${escapeHtml(map.coordinatesText)}</span>`}

      </div>

    </div>`;
  const metaItems = extraMetaFirst && extraMeta
    ? [extraMeta, statusMeta, coordinatesMeta]
    : [statusMeta, coordinatesMeta, extraMeta];
  return `    <div class="place-meta-row${extraMeta ? " has-extra-meta" : ""}">

${metaItems.filter(Boolean).join("\n\n")}

    </div>`;
};
const mapPlaces = locations.features.flatMap((feature) => {
  const markerPlace = placesById.get(feature.properties?.place_id);
  const coordinates = feature.geometry?.type === "Point" ? feature.geometry.coordinates : null;
  if (!markerPlace || !Array.isArray(coordinates) || coordinates.length < 2 || !coordinates.every(Number.isFinite)) {
    return [];
  }
  return [{
    place: markerPlace,
    longitude: coordinates[0],
    latitude: coordinates[1]
  }];
});
const mapChurches = churches
  .filter((church) => Number.isFinite(church.longitude) && Number.isFinite(church.latitude))
  .map((church) => ({ church, longitude: church.longitude, latitude: church.latitude }));
const churchCardDisplayName = (church) => church.name;
const renderMapSection = (place, map) => {
  return `  <section
    class="place-map"
    aria-label="Карта: ${escapeHtml(displayName(place))}">

    <div class="map-frame">

      <div
        id="village-map"
        aria-label="Интерактивная карта: ${escapeHtml(displayName(place))}">
      </div>

    </div>

  </section>`;
};
const renderMapScripts = (place, map, isChurchPage = false) => `<!-- OpenLayers -->

<script src="https://cdn.jsdelivr.net/npm/ol@10.11.0/dist/ol.js"></script>
<script src="../../js/map-marker-settings.js"></script>

<script>
  const villageLat = ${map.latitude};
  const villageLon = ${map.longitude};
  const activePlaceId = ${JSON.stringify(place.id)};
  const placePagePath = ${JSON.stringify(isChurchPage ? "../../places/" : "../")};
  const markerContainer = document.querySelector(".map-frame");
  const markerSettings = window.BelozeryeMapMarkers;
  const cardMarkerEntries = [];
  const cardClusterOverlays = [];

  const map = new ol.Map({
    target: "village-map",
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
    interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: true }),
    view: new ol.View({
      center: ol.proj.fromLonLat([villageLon, villageLat]),
      zoom: ${map.zoom}
    }),
    controls: ol.control.defaults.defaults({ attribution: true, zoom: true, rotate: false }).extend([
      new ol.control.ScaleLine({ units: "metric" }),
      new ol.control.FullScreen()
    ])
  });
  const updateCardClusters = () => {
    cardClusterOverlays.splice(0).forEach((overlay) => map.removeOverlay(overlay));
    cardMarkerEntries.forEach((entry) => {
      entry.element.style.display = "";
      entry.labelElement.style.visibility = "";
    });
    const visibleLabelBounds = [];
    const allIconEntries = cardMarkerEntries.map((entry) => ({
      entry,
      bounds: entry.iconElement.getBoundingClientRect()
    }));
    for (const entry of [...cardMarkerEntries].sort((left, right) => Number(right.active) - Number(left.active))) {
      const labelBounds = entry.labelElement.getBoundingClientRect();
      if (entry.active) {
        visibleLabelBounds.push(labelBounds);
        continue;
      }
      const overlapsIcon = allIconEntries.some((item) => item.entry !== entry
        && markerSettings.clusters.overlaps(labelBounds, item.bounds));
      const overlapsLabel = visibleLabelBounds.some((bounds) => markerSettings.clusters.overlaps(labelBounds, bounds));
      if (overlapsIcon || overlapsLabel) entry.labelElement.style.visibility = "hidden";
      else visibleLabelBounds.push(labelBounds);
    }
    for (const kind of ["place", "church"]) {
      const entries = cardMarkerEntries.filter((entry) => entry.marker.kind === kind && !entry.active).map((entry) => {
        const coordinate = ol.proj.fromLonLat([entry.marker.longitude, entry.marker.latitude]);
        const rect = entry.iconElement.getBoundingClientRect();
        return { ...entry, kind, coordinate, bounds: {
          left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom
        } };
      });
      for (const group of markerSettings.clusters.group(entries)) {
        if (group.length < 2) continue;
        const members = group;
        members.forEach((member) => { member.element.style.display = "none"; });
        const clusterElement = document.createElement("button");
        clusterElement.type = "button";
        clusterElement.className = "map-marker-cluster" + (kind === "church" ? " is-church" : "");
        clusterElement.style.zIndex = String(markerSettings.clusters.zIndex);
        clusterElement.style.pointerEvents = "auto";
        clusterElement.textContent = String(members.length);
        clusterElement.setAttribute("aria-label", "Приблизить группу из " + members.length + " объектов");
        clusterElement.addEventListener("click", () => {
          const extent = ol.extent.createEmpty();
          members.forEach((member) => ol.extent.extend(extent, new ol.geom.Point(member.coordinate).getExtent()));
          map.getView().fit(extent, { padding: [55, 55, 55, 55], maxZoom: 14, duration: 250 });
        });
        const center = members.reduce((sum, member) => [sum[0] + member.coordinate[0] / members.length, sum[1] + member.coordinate[1] / members.length], [0, 0]);
        const clusterOverlay = new ol.Overlay({
          element: clusterElement,
          positioning: "center-center",
          position: center,
          stopEvent: true
        });
        cardClusterOverlays.push(clusterOverlay);
        map.addOverlay(clusterOverlay);
      }
    }
    for (const entry of cardMarkerEntries.filter((item) => item.active)) {
      map.removeOverlay(entry.overlay);
      map.addOverlay(entry.overlay);
    }
    const clusterBounds = cardClusterOverlays.map((overlay) => overlay.getElement().getBoundingClientRect());
    for (const entry of cardMarkerEntries.filter((item) => item.element.style.display !== "none")) {
      if (entry.active) continue;
      if (!clusterBounds.some((bounds) => markerSettings.clusters.overlaps(entry.labelElement.getBoundingClientRect(), bounds))) continue;
      entry.labelElement.style.visibility = "hidden";
    }
  };
  map.on("moveend", updateCardClusters);

  const loadMapMarkers = async () => {
    try {
      const response = await fetch("../../data/place-markers.json", { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const markers = await response.json();
      markers.sort((left, right) => Number(left.id === activePlaceId) - Number(right.id === activePlaceId));

      for (const marker of markers) {
        const active = marker.id === activePlaceId;
        const markerElement = document.createElement("a");
        markerElement.className = "village-marker-link" + (active ? " is-active" : "") + (marker.kind === "church" ? " is-church" : "");
        markerElement.style.zIndex = String(active ? markerSettings.active.zIndex : 0);
        markerElement.style.gap = marker.kind === "church"
          ? (active ? markerSettings.church.activeLabelGap : markerSettings.church.labelGap) + "px"
          : markerSettings.place.labelOffsetX - 1 + "px";
        markerElement.href = active ? "./" : marker.kind === "church"
          ? "../../churches/" + encodeURIComponent(marker.slug) + "/"
          : placePagePath + encodeURIComponent(marker.slug) + "/";
        markerElement.setAttribute("aria-label", (active ? "Открыта страница" : "Открыть страницу") + ": " + marker.name);
        if (active) markerElement.setAttribute("aria-current", "page");

        const dot = marker.kind === "church"
          ? (() => {
              const icon = document.createElement("img");
              icon.className = "church-marker-icon";
              icon.src = "../../images/icons/church-marker.png";
              icon.alt = "";
              icon.width = markerSettings.church.iconWidth;
              icon.height = markerSettings.church.iconHeight;
              icon.style.width = markerSettings.church.iconWidth + "px";
              icon.style.height = markerSettings.church.iconHeight + "px";
              return icon;
            })()
          : (() => {
              const icon = document.createElement("span");
              icon.className = "village-marker-dot";
              icon.style.width = markerSettings.place.diameter + "px";
              icon.style.height = markerSettings.place.diameter + "px";
              icon.style.borderWidth = markerSettings.place.strokeWidth + "px";
              return icon;
            })();
        const label = document.createElement("span");
        label.className = "village-marker-name";
        label.textContent = marker.name;
        if (marker.kind === "church") markerElement.append(label, dot);
        else markerElement.append(dot, label);
        markerContainer.append(markerElement);

        const villageOverlay = new ol.Overlay({
          element: markerElement,
          positioning: marker.kind === "church" ? "center-right" : "center-left",
          offset: marker.kind === "church"
            ? [dot.offsetWidth / 2, markerSettings.church.labelOffsetY]
            : [-dot.offsetWidth / 2, 0],
          stopEvent: active
        });
        villageOverlay.setPosition(ol.proj.fromLonLat([marker.longitude, marker.latitude]));
        map.addOverlay(villageOverlay);
        cardMarkerEntries.push({ marker, element: markerElement, iconElement: dot, labelElement: label, active, overlay: villageOverlay });
        if (marker.kind === "church") dot.addEventListener("load", () => requestAnimationFrame(updateCardClusters), { once: true });
      }
      requestAnimationFrame(updateCardClusters);
    } catch (error) {
      console.error("Не удалось загрузить маркеры населённых пунктов.", error);
    }
  };

  loadMapMarkers();
</script>`;
const renderSourceViewer = () => `
<dialog class="source-viewer-dialog" id="source-viewer-dialog" aria-label="Просмотр фрагмента книги">
  <div class="source-viewer-header">
    <strong id="source-viewer-title">Фрагмент книги</strong>
    <button type="button" class="source-viewer-close" data-source-viewer-close>Закрыть</button>
  </div>
  <iframe id="source-viewer-frame" title="Фрагмент книги"></iframe>
  <a id="source-viewer-open-book" target="_blank" rel="noopener">Открыть книгу целиком</a>
</dialog>
<script>
  (() => {
    const dialog = document.querySelector("#source-viewer-dialog");
    const frame = document.querySelector("#source-viewer-frame");
    const title = document.querySelector("#source-viewer-title");
    const openBook = document.querySelector("#source-viewer-open-book");
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-source-viewer]");
      if (!trigger) return;
      title.textContent = trigger.dataset.sourceLabel || "Фрагмент книги";
      frame.src = trigger.dataset.bookUrl;
      openBook.href = trigger.dataset.bookUrl;
      dialog.showModal();
    });
    document.querySelector("[data-source-viewer-close]").addEventListener("click", () => {
      dialog.close();
      frame.removeAttribute("src");
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  })();
</script>`;
const renderSourceWindowSizing = () => `<script>
  (() => {
    const setFrameHeight = (frame, height) => {
      if (!Number.isFinite(height) || height <= 0) return;
      const window = frame.closest(".source-document-window");
      if (window) {
        const fragmentHeight = Math.ceil(height);
        window.dataset.fragmentHeight = String(fragmentHeight);
        window.style.height = fragmentHeight + "px";
      }
    };
    const resizeToFragment = (frame) => {
      try {
        const document = frame.contentDocument;
        const target = document?.getElementById(frame.dataset.fragmentAnchor);
        const endTarget = document?.getElementById(frame.dataset.fragmentEndAnchor ?? frame.dataset.fragmentAnchor);
        const fragment = endTarget?.closest("section.place-record, section.record");
        if (!target || !fragment) return;
        const ownHeading = (element) => element?.matches("h1,h2,h3,h4,h5,h6")
          ? element
          : element?.querySelector(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6") ?? element;
        const targetHeading = ownHeading(target);
        const endHeading = ownHeading(endTarget);
        const headings = [...fragment.querySelectorAll("h1,h2,h3,h4,h5,h6")];
        const endHeadingIndex = headings.indexOf(endHeading);
        const currentPlaceHeadingIndex = endHeading.classList.contains("place-heading")
          ? endHeadingIndex
          : headings.findIndex((heading, index) => index >= endHeadingIndex && heading.classList.contains("place-heading"));
        const nextHeading = headings
          .slice(currentPlaceHeadingIndex + 1)
          .find((heading) => heading.classList.contains("place-heading"));
        const boundary = nextHeading?.getBoundingClientRect().top;
        let bottom = targetHeading.getBoundingClientRect().bottom;
        for (const element of fragment.querySelectorAll("*")) {
          const rect = element.getBoundingClientRect();
          if (boundary !== undefined && (rect.top >= boundary || rect.bottom > boundary)) continue;
          bottom = Math.max(bottom, rect.bottom);
        }
        const height = bottom - target.getBoundingClientRect().top + 2;
        setFrameHeight(frame, height);
      } catch (error) {
        console.warn("Не удалось определить высоту фрагмента источника.", error);
      }
    };
    const scrollToFragment = (frame) => {
      try {
        const target = frame.contentDocument?.getElementById(frame.dataset.fragmentAnchor);
        if (!target || !frame.contentWindow) return false;
        const targetTop = frame.contentWindow.scrollY + target.getBoundingClientRect().top;
        frame.contentWindow.scrollTo({ top: targetTop, left: 0, behavior: "auto" });
        return true;
      } catch (error) {
        console.warn("Не удалось вернуться к фрагменту источника.", error);
        return false;
      }
    };
    const revealFrameAtFragment = (frame) => {
      if (scrollToFragment(frame)) frame.classList.add("source-fragment-ready");
    };
    addEventListener("message", (event) => {
      if (event.origin !== location.origin || event.data?.type !== "belozerye-source-fragment") return;
      for (const frame of document.querySelectorAll(".source-document-window iframe")) {
        if (event.source === frame.contentWindow && event.data.anchor === frame.dataset.fragmentAnchor && event.data.endAnchor === (frame.dataset.fragmentEndAnchor ?? frame.dataset.fragmentAnchor)) {
          setFrameHeight(frame, event.data.height);
        }
      }
    });
    for (const frame of document.querySelectorAll(".source-document-window iframe")) {
      const prepareFrame = () => {
        if (frame.dataset.fragmentPrepareScheduled) return;
        frame.dataset.fragmentPrepareScheduled = "true";
        setTimeout(() => {
          resizeToFragment(frame);
          requestAnimationFrame(() => revealFrameAtFragment(frame));
        }, 520);
      };
      frame.addEventListener("load", prepareFrame);
      if (frame.contentDocument?.getElementById(frame.dataset.fragmentAnchor)) prepareFrame();
      setTimeout(() => resizeToFragment(frame), 700);
      setTimeout(() => resizeToFragment(frame), 2000);
    }
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-return-to-fragment]");
      if (!button) return;
      const frame = button.closest(".source-fragment")?.querySelector("iframe");
      if (!frame) return;
      scrollToFragment(frame);
    });
    for (const handle of document.querySelectorAll("[data-source-resize]")) {
      handle.addEventListener("dblclick", () => {
        const window = handle.closest(".source-fragment")?.querySelector(".source-document-window");
        const initialHeight = Number(window?.dataset.fragmentHeight);
        if (window && initialHeight > 0) window.style.height = initialHeight + "px";
      });
      handle.addEventListener("pointerdown", (event) => {
        const window = handle.closest(".source-fragment")?.querySelector(".source-document-window");
        if (!window) return;
        event.preventDefault();
        const startY = event.clientY;
        const startHeight = window.getBoundingClientRect().height;
        const minimumHeight = Number(window.dataset.fragmentHeight) || 1;
        const resize = (moveEvent) => {
          window.style.height = Math.max(minimumHeight, startHeight + moveEvent.clientY - startY) + "px";
        };
        const finish = () => handle.removeEventListener("pointermove", resize);
        handle.setPointerCapture(event.pointerId);
        handle.addEventListener("pointermove", resize);
        handle.addEventListener("pointerup", finish, { once: true });
        handle.addEventListener("pointercancel", finish, { once: true });
      });
    }
  })();
</script>`;
const fillTemplate = (source, values) => {
  let result = source;
  for (const [key, value] of Object.entries(values)) result = result.replaceAll(`{{${key}}}`, value);
  const unresolved = result.match(/{{[A-Z0-9_]+}}/g);
  if (unresolved) throw new Error(`Не заполнены поля шаблона: ${unresolved.join(", ")}`);
  return result;
};
const renderContextHistory = (mentions, valuesForContext) => {
  const grouped = new Map();
  for (const [index, mention] of mentions.entries()) {
    const fragment = fragmentsById.get(mention.fragment_id);
    const book = booksById.get(fragment.book_id);
    for (const item of valuesForContext(mention.source_context ?? {})) {
      const value = typeof item === "string" ? item : item?.value;
      const period = typeof item === "string" ? book.year : item?.period ?? book.year;
      if (!value) continue;
      const group = grouped.get(value) ?? { value, periods: [], position: index, year: Infinity };
      if (!group.periods.includes(period)) group.periods.push(period);
      group.position = Math.min(group.position, index);
      group.year = Math.min(group.year, sourceYearValue(period));
      grouped.set(value, group);
    }
  }
  return [...grouped.values()]
    .sort((left, right) => left.year - right.year || left.position - right.position || left.value.localeCompare(right.value, "ru"))
    .map(({ value, periods }) => `${escapeHtml(value)} (${periods.sort((left, right) => sourceYearValue(left) - sourceYearValue(right)).map(escapeHtml).join(", ")})`)
};
const renderOverviewItems = (items) => items.map((item) => `        <li>${item}</li>`).join("\n");
const renderQuotedFragment = (mention, mergedMentions = []) => {
  const fragment = fragmentsById.get(mention.fragment_id);
  const book = booksById.get(fragment.book_id);
  const place = placesById.get(mention.place_id);
  const fragmentAnchor = fragment.id;
  const selfLinkPattern = new RegExp(
    `<a\\b([^>]*\\s)?href="\\.\\.\\/\\.\\.\\/places\\/(?:${escapeRegex(place.slug)}|${escapeRegex(place.legacy_slug ?? place.slug)})\\/"[^>]*>([\\s\\S]*?)<\\/a>`,
    "giu"
  );
  const sourceFragmentHref = `../../books/${encodeURIComponent(book.slug)}/#${encodeURIComponent(fragmentAnchor)}`;
  const fragmentHtml = fragment.html?.replace(
    selfLinkPattern,
    (_match, attributes = "", content) => fragment.link_self_reference_to_source
      ? `<a${attributes ?? ""}href="${sourceFragmentHref}">${content}</a>`
      : content
  ) ?? "";
  const mergedHtml = mergedMentions.map((mergedMention) => {
    const mergedFragment = fragmentsById.get(mergedMention.fragment_id);
    const mergedAnchor = mergedFragment.id;
    const mergedPunctuation = mergedMention.source_punctuation ?? ",";
    const mergedFragmentHtml = mergedFragment.html?.replace(selfLinkPattern, "$2") ?? "";
    return `<div class="merged-fragment"><h3 class="place-heading merged-place-heading"><a href="../../books/${encodeURIComponent(book.slug)}/#${encodeURIComponent(mergedAnchor)}">${escapeHtml(mergedMention.source_name)}</a><span class="heading-comma">${escapeHtml(mergedPunctuation)}</span></h3>${mergedPunctuation ? " " : ""}${mergedFragmentHtml}</div>`;
  }).join("\n");
  return `          <div class="transcription-fragment${fragment.hide_source_heading ? " is-headingless" : ""}" data-book-id="${escapeHtml(book.id)}">
            <span class="page-mark">${escapeHtml(formatFolioMark(fragment.folio, book))}</span>
            ${fragment.hide_source_heading ? "" : `<h3 class="place-heading"><a href="../../books/${encodeURIComponent(book.slug)}/#${encodeURIComponent(fragmentAnchor)}">${escapeHtml(mention.source_name)}</a></h3>`}${fragmentHtml || mergedHtml ? `<div class="village-lines">${fragmentHtml}${mergedHtml}</div>` : ""}
          </div>`;
};
const renderQuotedFragments = (sourceMentions) => {
  const groups = [];
  for (const mention of sourceMentions) {
    const fragment = fragmentsById.get(mention.fragment_id);
    if (fragment.merge_with_previous && groups.length > 0) {
      groups.at(-1).mergedMentions.push(mention);
    } else {
      groups.push({ mention, mergedMentions: [] });
    }
  }
  return groups
    .map(({ mention, mergedMentions }) => renderQuotedFragment(mention, mergedMentions))
    .join("\n\n");
};
const sourceFragmentAnchor = (fragment, book) => {
  // This split mention starts in an inline span on the same line as the
  // heading. Target the containing record so the embedded view keeps the
  // record's normal top spacing.
  if (fragment.id === "belozersky-1544-place-12-1-metropolitan") {
    return fragment.source_heading_id;
  }
  if (fragment.content_class) return fragment.id;
  if (book.id !== "belozersky-1544") return fragment.id;
  // The 1544 book prefixes section IDs during its rendering; the final record
  // is the one exception and retains its original heading ID.
  if (fragment.source_heading_id === "place-12-1") return fragment.source_heading_id;
  return `${book.id}-${fragment.source_heading_id}`;
};
const renderSourceGroup = (sourceMentions, index) => {
  const firstMention = sourceMentions[0];
  const book = booksById.get(fragmentsById.get(firstMention.fragment_id).book_id);
  const headingId = `source-${index + 1}`;
  const sourceWindowGroups = [];
  for (const mention of sourceMentions) {
    const fragment = fragmentsById.get(mention.fragment_id);
    if (fragment.merge_with_previous && sourceWindowGroups.length > 0) sourceWindowGroups.at(-1).push(mention);
    else sourceWindowGroups.push([mention]);
  }
  const sourceWindows = sourceWindowGroups.map((windowMentions) => {
    const mention = windowMentions[0];
    const fragment = fragmentsById.get(mention.fragment_id);
    const targetAnchor = sourceFragmentAnchor(fragment, book);
    const lastMention = windowMentions.at(-1);
    const lastFragment = fragmentsById.get(lastMention.fragment_id);
    const endAnchor = sourceFragmentAnchor(lastFragment, book);
    const label = mention.source_name;
    // The height is based on the former quotation size so the frame occupies
    // the same card space while allowing the full source text to be scrolled.
    const textLength = windowMentions.reduce((total, item) => {
      const itemFragment = fragmentsById.get(item.fragment_id);
      return total + plainText(itemFragment.html ?? "").length + String(item.source_name ?? "").length;
    }, 0);
    const windowHeight = Math.max(230, Math.min(540, 135 + Math.ceil(textLength / 52) * 24));
    const bookUrl = `../../books/${encodeURIComponent(book.slug)}/?embed=1&view=fragment-layout-8&revision=15&end=${encodeURIComponent(endAnchor)}#${encodeURIComponent(targetAnchor)}`;
    return `<div class="source-content-card">
            <div class="source-fragment">
              <section class="source-document-window" aria-label="${escapeHtml(label)}" style="height:${windowHeight}px">
                <iframe src="${bookUrl}" title="${escapeHtml(label)}" loading="lazy" data-fragment-anchor="${escapeHtml(targetAnchor)}" data-fragment-end-anchor="${escapeHtml(endAnchor)}"></iframe>
              </section>
              <div class="source-resize-handle" data-source-resize role="separator" aria-orientation="horizontal" aria-label="Потяните нижнюю границу вниз, чтобы увеличить окно" title="Потяните нижнюю границу вниз, чтобы увеличить окно"></div>
              <button class="source-fragment-reset" type="button" data-return-to-fragment aria-label="Вернуться к фрагменту" title="Вернуться к фрагменту"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.5 11h2.25v9h14.5v-9h2.25L12 3Z"/></svg></button>
            </div>
          </div>`;
  }).join("\n");
  const sourceContent = sourceWindows;
  return `
    <section class="mention-card" aria-labelledby="${headingId}">

      <details class="source-details">

        <summary>
          <span class="source-summary-copy">
            <span id="${headingId}" class="source-title">
              <a href="../../books/${encodeURIComponent(book.slug)}/">
                ${escapeHtml(book.short_title)}
              </a>
            </span>
          </span>
        </summary>

        <div class="source-body">

${sourceContent}

        </div>

      </details>
    </section>`;
};

const expectedFiles = new Map();
expectedFiles.set(path.join(root, "dist", "404.html"), notFoundTemplate);
expectedFiles.set(path.join(root, "dist", "_headers"), responseHeaders);
const book1544 = books.find((book) => book.id === "belozersky-1544");
if (book1544) {
  const book1544Path = path.join(root, "dist", "books", book1544.slug, "index.html");
  expectedFiles.set(book1544Path, bookHtmlByPath.get(book1544Path));
}
const mapMarkerData = [...mapPlaces.map((marker) => ({
  id: marker.place.id,
  slug: marker.place.slug,
  name: mainPlaceName(marker.place),
  kind: "place",
  longitude: marker.longitude,
  latitude: marker.latitude
})), ...mapChurches.map((marker) => ({
  id: marker.church.id,
  slug: marker.church.slug,
  name: marker.church.name,
  kind: "church",
  longitude: marker.longitude,
  latitude: marker.latitude
}))];
const mapFilterMetadata = (placeId) => {
  const placeMentions = mentions.filter((mention) => mention.place_id === placeId);
  const booksForPlace = new Set();
  const administrative = new Set();
  const administrativeRecords = [];
  const land = new Set();
  const owners = new Set();
  const landByBook = new Map();
  const ownersByBook = new Map();
  const ownersByLandByBook = new Map();
  for (const mention of placeMentions) {
    const fragment = fragmentsById.get(mention.fragment_id);
    if (fragment) booksForPlace.add(fragment.book_id);
    const context = mention.source_context ?? {};
    for (const key of ["uezd", "prikaz", "volost", "subdivision"]) if (context[key]) administrative.add(context[key]);
    const hasAdministrativeContext = context.uezd || context.prikaz || context.volost || context.subdivision;
    if (fragment && hasAdministrativeContext) administrativeRecords.push({
      book: fragment.book_id,
      uezd: context.uezd ?? null,
      uezd_label: context.uezd ? `${context.uezd} уезд` : null,
      prikaz: context.prikaz ?? null,
      prikaz_label: context.prikaz ? `${context.prikaz} приказ` : null,
      volost: context.volost ?? null,
      volost_label: context.volost ? (context.volost_label ? `${context.volost_label[0].toLocaleUpperCase("ru-RU")}${context.volost_label.slice(1)}` : `${context.volost} волость`) : null,
      child: context.subdivision ?? null,
      child_label: context.subdivision ?? null
    });
    for (const category of context.land_categories ?? []) {
      if (category.label) {
        land.add(category.label);
        if (fragment) (landByBook.get(fragment.book_id) ?? landByBook.set(fragment.book_id, new Set()).get(fragment.book_id)).add(category.label);
      }
      for (const owner of category.owners ?? []) {
        owners.add(owner);
        if (fragment) (ownersByBook.get(fragment.book_id) ?? ownersByBook.set(fragment.book_id, new Set()).get(fragment.book_id)).add(owner);
        if (fragment && category.label) {
          const byLand = ownersByLandByBook.get(fragment.book_id) ?? ownersByLandByBook.set(fragment.book_id, new Map()).get(fragment.book_id);
          (byLand.get(category.label) ?? byLand.set(category.label, new Set()).get(category.label)).add(owner);
        }
      }
    }
  }
  return {
    books: [...booksForPlace], administrative: [...administrative],
    administrative_records: administrativeRecords,
    land: [...land], owners: [...owners],
    land_by_book: Object.fromEntries([...landByBook].map(([book, values]) => [book, [...values]])),
    owners_by_book: Object.fromEntries([...ownersByBook].map(([book, values]) => [book, [...values]])),
    owners_by_land_by_book: Object.fromEntries([...ownersByLandByBook].map(([book, byLand]) => [book, Object.fromEntries([...byLand].map(([land, values]) => [land, [...values]]))]))
  };
};
const mapFilterData = [
  ...mapPlaces.map((marker) => {
    const metadata = mapFilterMetadata(marker.place.id);
    return {
      id: marker.place.id, slug: marker.place.slug, name: mainPlaceName(marker.place), kind: "place",
      type: marker.place.type.label, longitude: marker.longitude, latitude: marker.latitude, ...metadata
    };
  }),
  ...mapChurches.map((marker) => {
    const metadata = mapFilterMetadata(marker.church.location_place_id);
    for (const source of churchSourcesByChurchId.get(marker.church.id) ?? []) {
      const fragment = fragmentsById.get(source.fragment_id);
      if (fragment) {
        metadata.books.push(fragment.book_id);
      }
    }
    metadata.books = [...new Set(metadata.books)];
    return {
      id: marker.church.id, slug: marker.church.slug, name: marker.church.name, kind: "church",
      type: "Церковь", longitude: marker.longitude, latitude: marker.latitude, ...metadata
    };
  })
];
expectedFiles.set(
  path.join(root, "dist", "data", "place-markers.json"),
  `${JSON.stringify(mapMarkerData, null, 2)}\n`
);
expectedFiles.set(path.join(root, "dist", "js", "map-marker-settings.js"), mapMarkerSettings);
const mapPageHtml = fillTemplate(mapPageTemplate, {
  MAP_FILTER_DATA: JSON.stringify(mapFilterData).replaceAll("<", "\\u003c"),
  BOOK_OPTIONS: JSON.stringify(books.map((book) => ({ value: book.id, label: book.short_title }))).replaceAll("<", "\\u003c")
});
expectedFiles.set(path.join(root, "dist", "map", "index.html"), mapPageHtml);

const churovskoyeLocation = locations.features.find(
  (feature) => feature.properties?.place_id === "pogost-rozhestva-bogoroditsy"
);
if (!churovskoyeLocation) throw new Error("Не найдены координаты Чуровского для центра карты Чуровской волости.");

const placeNameCounts = new Map();
for (const place of places) {
  const name = mainPlaceName(place);
  placeNameCounts.set(name, (placeNameCounts.get(name) ?? 0) + 1);
}
const shortAdministrativeLabel = (context) => {
  if (context.prikaz) return `${context.prikaz} приказ`;
  if (context.stan) return `${context.stan} стан`;
  if (context.volost_label) return context.volost_label;
  if (context.volost) return `${context.volost} волость`;
  return `${context.uezd} уезд`;
};

for (const place of places) {
  const placeMentions = mentions.filter((mention) => mention.place_id === place.id);
  if (placeMentions.length === 0) throw new Error(`У поселения ${place.id} нет ни одного упоминания.`);
  placeMentions.sort((a, b) => {
    const aFragment = fragmentsById.get(a.fragment_id);
    const bFragment = fragmentsById.get(b.fragment_id);
    const aBook = booksById.get(aFragment.book_id);
    const bBook = booksById.get(bFragment.book_id);
    return sourceYearValue(aBook.year) - sourceYearValue(bBook.year) || aFragment.order - bFragment.order;
  });
  const placeLocation = locations.features.find((feature) => feature.properties?.place_id === place.id);
  const isChurovskayaVolost = placeMentions.some(
    (mention) => /^чуровск/iu.test(String(mention.source_context?.volost ?? ""))
  );
  const map = renderMap(placeLocation, isChurovskayaVolost ? churovskoyeLocation : null);
  const historicalNameMentions = placeMentions.sort((a, b) => {
    const aFragment = fragmentsById.get(a.fragment_id);
    const bFragment = fragmentsById.get(b.fragment_id);
    const aBook = booksById.get(aFragment.book_id);
    const bBook = booksById.get(bFragment.book_id);
    return sourceYearValue(aBook.year) - sourceYearValue(bBook.year) || aFragment.order - bFragment.order;
  });
  const historicalNamesByName = new Map();
  const formerHistoricalNamesByName = new Map();
  for (const mention of historicalNameMentions) {
    const fragment = fragmentsById.get(mention.fragment_id);
    const book = booksById.get(fragment.book_id);
    const formerHistoricalName = formerPlaceName(mention.source_name);
    if (formerHistoricalName) {
      const yearLabels = formerHistoricalNamesByName.get(formerHistoricalName) ?? [];
      const yearLabel = `до ${book.year}`;
      if (!yearLabels.includes(yearLabel)) yearLabels.push(yearLabel);
      formerHistoricalNamesByName.set(formerHistoricalName, yearLabels);
    }
    const historicalNameSource = mention.historical_name_override ?? mention.source_name;
    const historicalName = normalizedPlaceName(historicalNameSource);
    const years = historicalNamesByName.get(historicalName) ?? [];
    if (!years.includes(book.year)) years.push(book.year);
    historicalNamesByName.set(historicalName, years);
  }
  const allMentionYears = [...new Set(historicalNameMentions.map((mention) => {
    const fragment = fragmentsById.get(mention.fragment_id);
    return booksById.get(fragment.book_id).year;
  }))];
  const groupedNameStates = new Map();
  for (const state of place.name_states ?? []) {
    const period = state.display_period ?? state.observed_year;
    if (!period || state.assertion_kind === "editorial") continue;
    const label = `${state.type_label ? `${state.type_label.toLocaleLowerCase("ru-RU")} ` : ""}${state.name}`;
    const group = groupedNameStates.get(label) ?? { label, periods: [], position: state.position, year: Infinity };
    if (!group.periods.includes(period)) group.periods.push(period);
    group.position = Math.min(group.position, state.position);
    group.year = Math.min(group.year, state.assertion_kind === "inferred" ? -Infinity : Number(String(period).match(/\d{4}/u)?.[0] ?? Infinity));
    groupedNameStates.set(label, group);
  }
  const stateNames = [...groupedNameStates.values()]
    .sort((left, right) => left.year - right.year || left.position - right.position)
    .map(({ label, periods }) => `${label} (${periods.sort((left, right) =>
      Number(String(left).match(/\d{4}/u)?.[0] ?? Infinity) - Number(String(right).match(/\d{4}/u)?.[0] ?? Infinity)
    ).join(", ")})`);
  const historicalNameParts = stateNames.length > 0
    ? [...new Set(stateNames)]
    : Array.isArray(place.name_variants) && place.name_variants.length > 0
    ? [place.name_variants
      .map((historicalName) => `${historicalName} (${allMentionYears.join(", ")})`)
      .join(", ")]
    : [...historicalNamesByName]
      .map(([historicalName, years]) => `${historicalName} (${years.join(", ")})`)
      ;
  if (stateNames.length === 0) {
    historicalNameParts.unshift(
      ...[...formerHistoricalNamesByName]
        .map(([historicalName, yearLabels]) => `${historicalName} (${yearLabels.join(", ")})`)
    );
  }
  const historicalNames = renderOverviewItems(historicalNameParts.map(escapeHtml));
  const administrativeAffiliations = renderContextHistory(placeMentions, (context) => [formatSourceContext(context)]);
  const landOwnerships = renderContextHistory(placeMentions, (context) =>
    (context.land_categories ?? [context.land_category])
      .map((category) => category?.label && ({
        value: `${category.label}${category.owners?.length ? `: ${category.owners.join(", ")}` : ""}`,
        period: category.display_period
      }))
      .filter(Boolean)
  );
  const linkedChurches = churchesByLocationPlaceId.get(place.id) ?? [];
  const churchesOverview = linkedChurches.length === 0 ? "" : `
    <details class="overview">
      <summary><span class="overview-label">Церкви</span></summary>
      <ul class="overview-value">
${renderOverviewItems(linkedChurches.map((church) => {
  const years = [...new Set((churchSourcesByChurchId.get(church.id) ?? []).map((source) => source.source_year))]
    .sort((left, right) => sourceYearValue(left) - sourceYearValue(right));
  if (years.length === 0) throw new Error(`Для церкви ${church.id} не указан источник.`);
  const label = `<a href="../../churches/${encodeURIComponent(church.slug)}/">${escapeHtml(churchCardDisplayName(church))}</a>`;
  return `${label} (${escapeHtml(years.join(", "))})`;
}))}
      </ul>
    </details>`;
  const sourceGroups = [];
  for (const mention of placeMentions) {
    const bookId = fragmentsById.get(mention.fragment_id).book_id;
    const group = sourceGroups.find((item) => item.bookId === bookId);
    if (group) group.mentions.push(mention);
    else sourceGroups.push({ bookId, mentions: [mention] });
  }
  if (!place.status?.label) throw new Error(`У поселения ${place.id} не заполнен статус.`);
  const name = mainPlaceName(place);
  const seoName = placeNameCounts.get(name) > 1
    ? `${name} (${shortAdministrativeLabel(placeMentions[0].source_context)})`
    : name;
  const html = fillTemplate(template, {
    PAGE_CLASS: "place-card",
    PAGE_TITLE: escapeHtml(seoName),
    PLACE_DISPLAY_NAME: escapeHtml(name),
    PLACE_META_BLOCK: renderPlaceMeta(place, map),
    HISTORICAL_NAMES: historicalNames,
    ADMINISTRATIVE_AFFILIATIONS: renderOverviewItems(administrativeAffiliations),
    LAND_OWNERSHIPS: renderOverviewItems(landOwnerships),
    CHURCHES_OVERVIEW: churchesOverview,
    MENTION_SECTIONS: sourceGroups.map((group, index) => renderSourceGroup(group.mentions, index)).join("\n"),
    MAP_SECTION: renderMapSection(place, map),
    MAP_SCRIPTS: `${renderMapScripts(place, map)}${renderSourceWindowSizing()}`
  });
  expectedFiles.set(path.join(root, "dist", "places", place.slug, "index.html"), html);
}

const renderChurchPage = (church) => {
  const sourceUrl = `../../books/${encodeURIComponent(church.book_slug)}/${church.source_anchor ? `#${encodeURIComponent(church.source_anchor)}` : ""}`;
  const hasCoordinates = Number.isFinite(church.longitude) && Number.isFinite(church.latitude);
  const coordinate = hasCoordinates ? `<a href="https://www.openstreetmap.org/?mlat=${church.latitude}&mlon=${church.longitude}#map=14/${church.latitude}/${church.longitude}" target="_blank" rel="noopener">${escapeHtml(formatCoordinate(church.latitude, "с. ш.", "ю. ш."))}, ${escapeHtml(formatCoordinate(church.longitude, "в. д.", "з. д."))}</a>` : "не установлены";
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Церковь ${escapeHtml(church.name)} — Белозерье</title><style>body{margin:0;color:#33281f;font:18px/1.55 Georgia,serif;background:#eee6c9 url('../../images/textures/parchment-seamless-v13.webp')}main{max-width:760px;margin:auto;padding:3rem 1.25rem}a{color:#9a3412}h1{line-height:1.15}dt{font:700 .75rem system-ui,sans-serif;text-transform:uppercase;color:#80664f;margin-top:1.4rem}dd{margin:.2rem 0}</style></head><body><main><a href="../../">Белозерье</a><h1>Церковь ${escapeHtml(church.name)}</h1><dl><dt>Координаты</dt><dd>${coordinate}</dd><dt>Источник</dt><dd><a href="${sourceUrl}">${escapeHtml(church.source_title)}</a></dd></dl></main></body></html>`;
};
const renderChurchCardLegacy = (church) => {
  const anchor = church.source_anchor ? `#${encodeURIComponent(church.source_anchor)}` : "";
  const sourceUrl = `../../books/${encodeURIComponent(church.book_slug)}/${anchor}`;
  const hasCoordinates = Number.isFinite(church.longitude) && Number.isFinite(church.latitude);
  const map = hasCoordinates
    ? `<iframe class="map" title="Карта" src="https://www.openstreetmap.org/export/embed.html?marker=${church.latitude}%2C${church.longitude}&layer=mapnik"></iframe>`
    : `<div class="map empty">Координаты не установлены</div>`;
  const fragment = church.source_anchor
    ? `<iframe class="fragment" title="Фрагмент источника" src="../../books/${encodeURIComponent(church.book_slug)}/?embed=1#${encodeURIComponent(church.source_anchor)}"></iframe>`
    : "";
  const coordinate = hasCoordinates
    ? `<a href="https://www.openstreetmap.org/?mlat=${church.latitude}&mlon=${church.longitude}" target="_blank" rel="noopener">${escapeHtml(formatCoordinate(church.latitude, "с. ш.", "ю. ш."))}, ${escapeHtml(formatCoordinate(church.longitude, "в. д.", "з. д."))}</a>`
    : "не установлены";
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Церковь ${escapeHtml(church.name)} — Белозерье</title><style>body{margin:0;color:#33281f;font:18px/1.55 Georgia,serif;background:#eee6c9 url('../../images/textures/parchment-seamless-v13.webp')}main{max-width:1100px;margin:auto;padding:2rem 1.25rem}.grid{display:grid;grid-template-columns:minmax(0,40fr) minmax(0,60fr);gap:2rem}a{color:#9a3412}h1{line-height:1.15}.map{width:100%;height:300px;border:0;background:#ddd}.empty{display:grid;place-items:center;color:#80664f}.fragment{width:100%;height:300px;border:1px solid #c9b890;background:#fffdf4}@media(max-width:700px){.grid{grid-template-columns:1fr}}</style></head><body><main><a href="../../">Белозерье</a><div class="grid"><section><h1>Церковь ${escapeHtml(church.name)}</h1><p><strong>Координаты:</strong> ${coordinate}</p><h2>Источник</h2><p><a href="${sourceUrl}">${escapeHtml(church.source_title)}</a></p>${fragment}</section><section>${map}</section></div></main></body></html>`;
};
const renderChurchCard = (church) => {
  const churchEntity = {
    id: church.id,
    slug: church.slug,
    name: churchCardDisplayName(church),
    status: { label: "не установлен" }
  };
  const mapLocation = Number.isFinite(church.longitude) && Number.isFinite(church.latitude)
    ? { geometry: { type: "Point", coordinates: [church.longitude, church.latitude] } }
    : null;
  const map = renderMap(mapLocation);
  const sources = churchSourcesByChurchId.get(church.id);
  if (!sources?.length) throw new Error(`Для церкви ${church.id} не указан источник.`);
  const source = sources.map((sourceItem) => {
    const fragmentAnchor = sourceItem.fragment_id;
    const encodedFragmentAnchor = encodeURIComponent(fragmentAnchor);
    const sourceUrl = `../../books/${encodeURIComponent(sourceItem.book_slug)}/?embed=1&view=fragment-layout-8&revision=15&end=${encodedFragmentAnchor}#${encodedFragmentAnchor}`;
    const sourceLink = `../../books/${encodeURIComponent(sourceItem.book_slug)}/#${encodeURIComponent(sourceItem.source_anchor)}`;
    return `<section class="mention-card"><details class="source-details"><summary><span class="source-summary-copy"><span class="source-title"><a href="${sourceLink}">${escapeHtml(sourceItem.source_title)}</a></span></span></summary><div class="source-body"><div class="source-content-card"><div class="source-fragment"><section class="source-document-window" aria-label="Фрагмент источника" style="height:320px"><iframe src="${sourceUrl}" title="Фрагмент источника" loading="lazy" data-fragment-anchor="${escapeHtml(fragmentAnchor)}" data-fragment-end-anchor="${escapeHtml(fragmentAnchor)}"></iframe></section><div class="source-resize-handle" data-source-resize role="separator" aria-orientation="horizontal" aria-label="Потяните нижнюю границу вниз, чтобы увеличить окно" title="Потяните нижнюю границу вниз, чтобы увеличить окно"></div><button class="source-fragment-reset" type="button" data-return-to-fragment aria-label="Вернуться к фрагменту" title="Вернуться к фрагменту"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.5 11h2.25v9h14.5v-9h2.25L12 3Z"/></svg></button></div></div></div></details></section>`;
  }).join("\n");
  const locationPlace = placesById.get(church.location_place_id);
  const locationMeta = `<div class="place-location">
      ${placeLocationIcon}
      <div class="location-text">
        <span class="location-label">Местоположение</span>
        ${locationPlace
          ? `<a class="location-coordinates" href="../../places/${encodeURIComponent(locationPlace.slug)}/">${escapeHtml(mainPlaceName(locationPlace))}</a>`
          : `<span class="location-coordinates">не установлено</span>`}
      </div>
    </div>`;
  return fillTemplate(template, {
    PAGE_CLASS: "church-card",
    PAGE_TITLE: escapeHtml(churchEntity.name),
    PLACE_DISPLAY_NAME: escapeHtml(churchEntity.name),
    PLACE_META_BLOCK: renderPlaceMeta(churchEntity, map, locationMeta, true),
    HISTORICAL_NAMES: "",
    ADMINISTRATIVE_AFFILIATIONS: "",
    LAND_OWNERSHIPS: "",
    CHURCHES_OVERVIEW: "",
    MENTION_SECTIONS: source,
    MAP_SECTION: renderMapSection(churchEntity, map),
    MAP_SCRIPTS: `${renderMapScripts(churchEntity, map, true)}${renderSourceWindowSizing()}`
  })
    .replace(/\s*<details class="overview">\s*<summary><span class="overview-label">Названия<\/span><\/summary>\s*<ul class="overview-value">\s*<\/ul>\s*<\/details>/u, "")
    .replace(/\s*<details class="overview">\s*<summary><span class="overview-label">Административная принадлежность<\/span><\/summary>\s*<ul class="overview-value">\s*<\/ul>\s*<\/details>/u, "")
    .replace(/\s*<details class="overview">\s*<summary><span class="overview-label">Принадлежность земли<\/span><\/summary>\s*<ul class="overview-value">\s*<\/ul>\s*<\/details>/u, "");
};
for (const church of churches) {
  expectedFiles.set(path.join(root, "dist", "churches", church.slug, "index.html"), renderChurchCard(church));
}

const bookUpdates = new Map();
for (const mention of mentions) {
  const place = placesById.get(mention.place_id);
  const fragment = fragmentsById.get(mention.fragment_id);
  const book = booksById.get(fragment.book_id);
  if (book.id === "belozersky-1544") {
    if (fragment.content_class || fragment.hide_source_heading) continue;
    const bookPath = path.join(root, "dist", "books", book.slug, "index.html");
    let html = bookUpdates.get(bookPath) ?? bookHtmlByPath.get(bookPath);
    const sectionPattern = new RegExp(`<section\\b[^>]*\\bid="${escapeRegex(fragment.source_heading_id)}"[^>]*>`, "iu");
    let sectionMatch = sectionPattern.exec(html);
    if (!sectionMatch) throw new Error(`Не найден исходный раздел ${fragment.source_heading_id} в книге ${book.id}.`);
    const updatedSectionOpening = sectionMatch[0].replace(/\bid="[^"]*"/iu, `id="${fragment.id}"`);
    html = html.slice(0, sectionMatch.index) + updatedSectionOpening + html.slice(sectionMatch.index + sectionMatch[0].length);
    sectionMatch[0] = updatedSectionOpening;
    const sectionCloseStart = html.indexOf("</section>", sectionMatch.index + sectionMatch[0].length);
    const sectionBody = html.slice(sectionMatch.index + sectionMatch[0].length, sectionCloseStart);
    const relativeHeading = /<h3\b[^>]*class="[^"]*\brecord-title\b[^"]*"[^>]*>/iu.exec(sectionBody);
    if (!relativeHeading) throw new Error(`Не найден исходный заголовок ${fragment.source_heading_id} в книге ${book.id}.`);
    const headingStart = sectionMatch.index + sectionMatch[0].length + relativeHeading.index;
    const headingOpenEnd = html.indexOf(">", headingStart);
    const headingCloseStart = html.indexOf("</h3>", headingOpenEnd);
    let headingInner = html.slice(headingOpenEnd + 1, headingCloseStart)
      .replace(/<a\b[^>]*>/giu, "")
      .replace(/<\/a>/giu, "");
    const punctuationIndex = headingInner.search(/<span\b[^>]*class="[^"]*\brecord-punctuation\b/iu);
    const titleHtml = punctuationIndex === -1 ? headingInner : headingInner.slice(0, punctuationIndex);
    const punctuationHtml = punctuationIndex === -1 ? "" : headingInner.slice(punctuationIndex);
    headingInner = `<a class="place-title-link" href="../../places/${place.slug}/" data-astro-cid-zcak6nys>${titleHtml}</a>${punctuationHtml}`;
    html = html.slice(0, headingOpenEnd + 1) + headingInner + html.slice(headingCloseStart);
    bookUpdates.set(bookPath, html);
    continue;
  }
  if (book.manage_place_links === false) continue;
  const bookPath = path.join(root, "dist", "books", book.slug, "index.html");
  let html = bookUpdates.get(bookPath) ?? bookHtmlByPath.get(bookPath);
  const headingId = fragment.source_heading_id ?? place.slug;
  const headingPattern = new RegExp(`<h([123])\\b[^>]*\\bid="${escapeRegex(headingId)}"[^>]*>`, "iu");
  const headingMatch = headingPattern.exec(html);
  if (!headingMatch) throw new Error(`Не найден заголовок ${headingId} в книге ${book.id}.`);

  const sectionStart = html.lastIndexOf("<section", headingMatch.index);
  const sectionOpenEnd = html.indexOf(">", sectionStart);
  if (sectionStart === -1 || sectionOpenEnd === -1) throw new Error(`Не найден раздел ${headingId} в книге ${book.id}.`);
  const sectionOpening = html.slice(sectionStart, sectionOpenEnd + 1);
  if (!/class="[^"]*\bplace-record\b[^"]*"/iu.test(sectionOpening)) {
    throw new Error(`Заголовок ${headingId} находится вне раздела place-record.`);
  }
  const updatedSectionOpening = /\bid="[^"]*"/iu.test(sectionOpening)
    ? sectionOpening.replace(/\bid="[^"]*"/iu, `id="${fragment.id}"`)
    : sectionOpening.replace("<section", `<section id="${fragment.id}"`);
  html = html.slice(0, sectionStart) + updatedSectionOpening + html.slice(sectionOpenEnd + 1);

  const shiftedHeadingMatch = headingPattern.exec(html);
  const headingOpenEnd = html.indexOf(">", shiftedHeadingMatch.index);
  const headingCloseStart = html.indexOf(`</h${shiftedHeadingMatch[1]}>`, headingOpenEnd);
  let headingInner = html.slice(headingOpenEnd + 1, headingCloseStart);
  const placeHref = `../../places/${place.slug}/`;
  const linkHtml = (content) => `<a class="place-title-link" href="${placeHref}" data-astro-cid-zcak6nys>${content}</a>`;
  headingInner = headingInner
    .replace(/<a\b[^>]*class="place-title-link"[^>]*>/giu, "")
    .replace(/<\/a>/giu, "");
  if (headingId === "church-lands-luzhkovo") {
    const luzhkovoPattern = /(<span\b[^>]*>\s*деревне Лужкове\s*<\/span>)/iu;
    if (!luzhkovoPattern.test(headingInner)) {
      throw new Error(`Не найдено название Лужкова в заголовке ${fragment.id}.`);
    }
    headingInner = headingInner.replace(luzhkovoPattern, (_, content) => linkHtml(content));
  } else if (fragment.link_target_id) {
    const targetPattern = new RegExp(
      `(<span\\b[^>]*\\bid="${escapeRegex(fragment.link_target_id)}"[^>]*>)([\\s\\S]*?)(<\\/span>)`,
      "iu"
    );
    if (!targetPattern.test(headingInner)) {
      throw new Error(`Не найдена цель ссылки ${fragment.link_target_id} во фрагменте ${fragment.id}.`);
    }
    headingInner = headingInner.replace(
      targetPattern,
      (_, opening, content, closing) => `${opening}${linkHtml(content)}${closing}`
    );
  } else {
    const commaIndex = headingInner.search(/<span\b[^>]*class="heading-comma"/iu);
    let titleHtml = commaIndex === -1 ? headingInner : headingInner.slice(0, commaIndex);
    const commaHtml = commaIndex === -1 ? "" : headingInner.slice(commaIndex);
    const outerSpan = /^(\s*<span\b[^>]*>)([\s\S]*)(<\/span>\s*)$/iu.exec(titleHtml);
    titleHtml = outerSpan
      ? `${outerSpan[1]}${linkHtml(outerSpan[2])}${outerSpan[3]}`
      : linkHtml(titleHtml);
    headingInner = `${titleHtml}${commaHtml}`;
  }
  html = html.slice(0, headingOpenEnd + 1) + headingInner + html.slice(headingCloseStart);
  bookUpdates.set(bookPath, html);
}

for (const [bookPath, html] of bookUpdates) expectedFiles.set(bookPath, html);
for (const book of books) {
  const bookPath = path.join(root, "dist", "books", book.slug, "index.html");
  expectedFiles.set(bookPath, bookUpdates.get(bookPath) ?? bookHtmlByPath.get(bookPath));
}

const homePath = path.join(root, "dist", "index.html");
const homeBookItems = books.map((book) => `          <article class="book-item">
            <span class="book-year">${escapeHtml(book.year)}</span>
            <div>
              <a class="book-title" href="./books/${encodeURIComponent(book.slug)}/">${escapeHtml(book.short_title)}</a>
              <div class="book-description">${escapeHtml(book.full_title)}</div>
            </div>
          </article>`).join("\n");
const homePlaceSearch = [...places]
  .sort((left, right) => mainPlaceName(left).localeCompare(mainPlaceName(right), "ru-RU"))
  .map((place) => ({
    slug: place.slug,
    name: mainPlaceName(place),
    type: place.type?.label ?? "Населённый пункт",
    search: [...new Set([
      mainPlaceName(place),
      ...(place.name_variants ?? []),
      ...(place.name_states ?? []).map((state) => state.name)
    ].filter(Boolean))]
  }));
const homeHtml = fillTemplate(homeTemplate, {
  BOOK_COUNT: String(books.length),
  PLACE_COUNT: String(places.length),
  CHURCH_COUNT: String(churches.length),
  LOCATED_COUNT: String(mapMarkerData.length),
  BOOK_ITEMS: homeBookItems,
  PLACE_SEARCH_DATA: JSON.stringify(homePlaceSearch).replaceAll("<", "\\u003c")
});
expectedFiles.set(homePath, homeHtml);

const publicPageUrls = [];
for (const [filePath, sourceHtml] of expectedFiles) {
  if (path.extname(filePath).toLocaleLowerCase() !== ".html") continue;
  const htmlWithoutDescriptions = sourceHtml
    .replace(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/giu, "")
    .replace(/<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/giu, "");
  if (path.basename(filePath) === "404.html") {
    expectedFiles.set(filePath, htmlWithoutDescriptions);
    continue;
  }
  const relativePath = path.relative(path.join(root, "dist"), filePath).split(path.sep).join("/");
  const pagePath = relativePath === "index.html" ? "/" : `/${relativePath.replace(/index\.html$/u, "")}`;
  const canonicalUrl = `${siteUrl}${pagePath}`;
  const title = sourceHtml.match(/<title>([\s\S]*?)<\/title>/iu)?.[1]?.trim();
  if (!title) throw new Error(`Для SEO-разметки не хватает title: ${relativePath}`);
  const socialMeta = `<link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:site_name" content="Белозерье">
  <meta property="og:title" content="${title}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta name="twitter:card" content="summary">`;
  expectedFiles.set(filePath, htmlWithoutDescriptions.replace(/<\/head>/iu, `  ${socialMeta}\n</head>`));
  publicPageUrls.push(canonicalUrl);
}

publicPageUrls.sort((left, right) => left.localeCompare(right, "ru-RU"));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPageUrls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>
`;
expectedFiles.set(path.join(root, "dist", "sitemap.xml"), sitemap);
expectedFiles.set(path.join(root, "dist", "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

let changed = 0;
for (const [filePath, expected] of expectedFiles) {
  let current = null;
  try {
    await access(filePath);
    current = await readFile(filePath, "utf8");
  } catch {}
  if (current === expected) continue;
  changed += 1;
  if (!checkOnly) {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, expected, "utf8");
  }
}

if (checkOnly && changed > 0) {
  throw new Error(`Сгенерированные файлы устарели: ${changed}. Запустите npm run build.`);
}

console.log(checkOnly ? "Данные и сгенерированные страницы согласованы." : `Сайт собран. Обновлено файлов: ${changed}.`);
