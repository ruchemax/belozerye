import { mkdir, writeFile } from "node:fs/promises";

const sourceOrigin = "http://127.0.0.1:4321";
const pagePath = "/ru/local_history/churovskaya-book-1626";
const pageScriptUrl = new URL(
  "/src/pages/ru/local_history/churovskaya-book-1626.astro",
  sourceOrigin,
);
pageScriptUrl.search = "astro&type=script&index=0&lang.ts";

const [pageResponse, scriptResponse] = await Promise.all([
  fetch(`${sourceOrigin}${pagePath}`),
  fetch(pageScriptUrl),
]);

if (!pageResponse.ok || !scriptResponse.ok) {
  throw new Error(`Не удалось получить исходную страницу: ${pageResponse.status}/${scriptResponse.status}`);
}

let html = await pageResponse.text();
const pageScript = (await scriptResponse.text()).replace(
  /\n?\/\/# sourceMappingURL=data:application\/json;base64,[^\n]*/,
  "",
);

html = html
  .replace(/<script\s+type="module"\s+src="[^"]+"><\/script>/g, "")
  .replace(/<script>window\.__astro_dev_toolbar__ = [\s\S]*?<\/script>/, "")
  .replace(/<astro-dev-toolbar[\s\S]*?<\/astro-dev-toolbar>/g, "")
  .replace(/\sdata-vite-dev-id="[^"]*"/g, "")
  .replace('<link rel="icon" href="/favicon.ico">', "")
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Писцовая книга Белозерского уезда 1626/27 г. — Белозерье</title>')
  .replace(/<link rel="preload" as="image" href="\/images\/background\/(?:main|publications|projects|contacts|software)-bg\.webp">/g, "")
  .replace('<a href="/ru" class="flex items-center gap-2">', '<a href="/" class="flex items-center gap-2">')
  .replace('<span class="font-semibold text-white">Maksim Ruchkin</span>', '<span class="font-semibold text-white">Белозерье</span>')
  .replace(
    /<ul class="hidden md:flex items-center gap-8 text-sm mx-auto">[\s\S]*?<\/ul>/,
    '<ul class="hidden md:flex items-center gap-8 text-sm mx-auto"><li><a class="text-white/85 hover:text-amber-400" href="#document-contents">Содержание</a></li></ul>',
  )
  .replace(
    /<div id="mobileMenu" class="hidden md:hidden border-t border-white\/10 bg-black\/60 backdrop-blur">[\s\S]*?<\/div>/,
    '<div id="mobileMenu" class="hidden md:hidden border-t border-white/10 bg-black/60 backdrop-blur"><ul class="mx-auto max-w-[1200px] px-4 py-4 space-y-3"><li><a class="block text-white/85 hover:text-amber-400 py-2 text-sm" href="#document-contents">Содержание</a></li></ul></div>',
  )
  .replace(/<div class="mx-auto mt-2 w-full max-w-\[1000px\] px-3 md:px-5"[^>]*><a[^>]+href="\/ru\/local_history\/belozerye"[\s\S]*?<\/a><\/div>/, "")
  .replace(/<footer class="border-t border-white\/10 p-4 text-sm text-white\/70 text-left">[\s\S]*?<\/footer>/, '<footer class="border-t border-white/10 p-4 text-sm text-white/70 text-left">© 2026 Максим Ручкин · Белозерье</footer>')
  .replace("</body>", `<script>${pageScript}</script></body>`);

await mkdir(new URL("./dist/", import.meta.url), { recursive: true });
await writeFile(new URL("./dist/index.html", import.meta.url), html, "utf8");

console.log(`Создан dist/index.html (${Buffer.byteLength(html, "utf8")} байт)`);
