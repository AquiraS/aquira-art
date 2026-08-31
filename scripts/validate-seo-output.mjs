import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://www.aquira.art";
const routes = [
  ["/", "index.html", "ja", "WebPage"],
  ["/accessibility/", "accessibility/index.html", "ja", "WebPage"],
  ["/tokushoho/", "tokushoho/index.html", "ja", "WebPage"],
  ["/about/", "about/index.html", "ja", "ProfilePage"],
  ["/policy/", "policy/index.html", "ja", "WebPage"],
  ["/ecosystem/", "ecosystem/index.html", "ja", "WebPage"],
  ["/works/", "works/index.html", "ja", "CollectionPage"],
  ["/practice/", "practice/index.html", "ja", "CollectionPage"],
  ["/official-network/", "official-network/index.html", "ja", "CollectionPage"],
  ["/licensing/", "licensing/index.html", "ja", "WebPage"],
  ["/faq/", "faq/index.html", "ja", "FAQPage"],
  ["/en/", "en/index.html", "en", "WebPage"],
  ["/en/accessibility/", "en/accessibility/index.html", "en", "WebPage"],
  ["/en/tokushoho/", "en/tokushoho/index.html", "en", "WebPage"],
  ["/en/about/", "en/about/index.html", "en", "ProfilePage"],
  ["/en/policy/", "en/policy/index.html", "en", "WebPage"],
  ["/en/ecosystem/", "en/ecosystem/index.html", "en", "WebPage"],
  ["/en/works/", "en/works/index.html", "en", "CollectionPage"],
  ["/en/practice/", "en/practice/index.html", "en", "CollectionPage"],
  ["/en/official-network/", "en/official-network/index.html", "en", "CollectionPage"],
  ["/en/licensing/", "en/licensing/index.html", "en", "WebPage"],
  ["/en/faq/", "en/faq/index.html", "en", "FAQPage"],
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function pairedPaths(pathname) {
  const japanese = pathname === "/en/" ? "/" : pathname.replace(/^\/en/, "");
  return [japanese, japanese === "/" ? "/en/" : `/en${japanese}`];
}

for (const [pathname, file, language, type] of routes) {
  const html = await readFile(path.join(root, file), "utf8");
  const canonical = `${origin}${pathname}`;
  const [japanesePath, englishPath] = pairedPaths(pathname);
  assert(html.includes(`<html lang="${language}">`), `${file}: document language is missing or incorrect`);
  assert(html.includes(`<link rel="canonical" href="${canonical}" />`), `${file}: canonical must self-reference`);
  assert(html.includes(`href="${origin}${japanesePath}" hreflang="ja"`), `${file}: Japanese alternate is missing`);
  assert(html.includes(`href="${origin}${englishPath}" hreflang="en"`), `${file}: English alternate is missing`);
  assert(html.includes(`href="${origin}${japanesePath}" hreflang="x-default"`), `${file}: x-default must remain Japanese-first`);
  assert((html.match(/<h1\b/g) ?? []).length === 1, `${file}: exactly one H1 is required`);
  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(schemaMatch, `${file}: JSON-LD is missing`);
  const graph = JSON.parse(schemaMatch[1])["@graph"] ?? [];
  assert(graph.some((item) => item["@type"] === type), `${file}: ${type} schema is missing`);
  assert(graph.some((item) => item["@type"] === "WebSite"), `${file}: WebSite schema is missing`);
  assert(graph.some((item) => item["@type"] === "Person" && item.name === "Aquira"), `${file}: Aquira Person schema is missing`);
  if (language === "en") {
    assert(html.includes(`class="language-link" href="${japanesePath}"`), `${file}: same-page Japanese switch link is missing`);
    assert(html.includes("language-link--current\" aria-current=\"page\">EN"), `${file}: current EN label is missing`);
    for (const leakedString of ["主要ナビゲーション", "お問い合わせ", "表示設定", "アクセシビリティに関する情報"]) {
      assert(!html.includes(leakedString), `${file}: untranslated Japanese interface string detected: ${leakedString}`);
    }
  } else {
    assert(html.includes(`class="language-link" href="${englishPath}"`), `${file}: same-page English switch link is missing`);
  }
}

const japaneseHome = await readFile(path.join(root, "index.html"), "utf8");
const englishHome = await readFile(path.join(root, "en/index.html"), "utf8");
assert(japaneseHome.includes('alt="梁のある室内、カウンター、花、吊り下げ照明、右側に立つ人物を写したモノクロ写真"'), "Japanese home image alt text is missing");
assert(englishHome.includes('alt="Black-and-white photograph of an interior with exposed beams, a counter, flowers, pendant lights, and a person standing on the right."'), "English home image alt text is missing");
assert(englishHome.includes('<link rel="preload" as="image"') && englishHome.includes('fetchpriority="high"'), "English home image preload is missing");
await access(path.join(root, "media/aquira-archive-interior.webp"));
await access(path.join(root, "media/aquira-archive-interior-mobile.webp"));

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
for (const [pathname] of routes) assert(sitemap.includes(`<loc>${origin}${pathname}</loc>`), `sitemap.xml: ${pathname} is missing`);
const robots = await readFile(path.join(root, "robots.txt"), "utf8");
for (const bot of ["GPTBot", "Google-Extended", "OAI-SearchBot", "ClaudeBot", "PerplexityBot"]) assert(robots.includes(`User-agent: ${bot}\nAllow: /`), `robots.txt: ${bot} allowance is missing`);
assert(robots.includes("User-agent: PetalBot\nDisallow: /"), "robots.txt: PetalBot block is missing");

const production = JSON.parse(await readFile(path.join(root, "ops/production.json"), "utf8"));
assert(production.production_origin === "https://www.aquira.art/", "production origin is incorrect");
assert(production.canonical_host === "www.aquira.art", "canonical host is incorrect");
assert(production.deployment_mode === "manual workflow dispatch", "deployment mode is incorrect");
console.log(`SEO validation passed: ${routes.length} bilingual pages, reciprocal alternates, self-canonicals, JSON-LD, assets, sitemap, and crawler rules.`);
