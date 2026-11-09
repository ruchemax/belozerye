(() => {
  if (!["127.0.0.1", "localhost", "[::1]"].includes(location.hostname)) return;
  const metadata = document.querySelector('meta[name="belozerye-book-revision"]');
  if (!metadata) return;
  let checking = false;
  const checkRevision = async () => {
    if (checking || document.visibilityState === "hidden") return;
    checking = true;
    try {
      const response = await fetch(new URL("../../book-revisions.json", location.href), { cache: "no-store" });
      if (!response.ok) return;
      const revisions = await response.json();
      const revision = revisions[metadata.dataset.bookSlug];
      if (!revision || revision === metadata.content) return;
      if (new URLSearchParams(location.search).get("embed") === "1") {
        const url = new URL(location.href);
        url.searchParams.set("revision", revision);
        location.replace(url.href);
      } else {
        location.reload();
      }
    } catch {
      // The local server may be stopped or rebuilding; retry on the next check.
    } finally {
      checking = false;
    }
  };
  setInterval(checkRevision, 3000);
  addEventListener("focus", checkRevision);
  document.addEventListener("visibilitychange", checkRevision);
})();
