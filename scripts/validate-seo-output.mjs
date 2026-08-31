/**
 * AQUIRA SEO/AEO output validation.
 * Verifies generated pages, canonical URLs, language metadata, JSON-LD, sitemap, and crawler rules.
 */
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetVersion = "20260831";
const checks = [
  { file: "index.html", canonical: "https://www.aquira.art/", type: "WebPage", language: "ja" },
  { file: "accessibility/index.html", canonical: "https://www.aquira.art/accessibility/", type: "WebPage", language: "ja" },
  { file: "tokushoho/index.html", canonical: "https://www.aquira.art/tokushoho/", type: "WebPage", language: "ja" },
  { file: "about/index.html", canonical: "https://www.aquira.art/about/", type: "ProfilePage", language: "ja" },
  { file: "policy/index.html", canonical: "https://www.aquira.art/policy/", type: "WebPage", language: "ja" },
  { file: "ecosystem/index.html", canonical: "https://www.aquira.art/ecosystem/", type: "WebPage", language: "ja" },
  { file: "works/index.html", canonical: "https://www.aquira.art/works/", type: "CollectionPage", language: "ja" },
  { file: "practice/index.html", canonical: "https://www.aquira.art/practice/", type: "CollectionPage", language: "ja" },
  { file: "official-network/index.html", canonical: "https://www.aquira.art/official-network/", type: "CollectionPage", language: "ja" },
  { file: "licensing/index.html", canonical: "https://www.aquira.art/licensing/", type: "WebPage", language: "ja" },
  { file: "faq/index.html", canonical: "https://www.aquira.art/faq/", type: "FAQPage", language: "ja" },
  { file: "en/index.html", canonical: "https://www.aquira.art/en/", type: "WebPage", language: "en" },
];

const journeyDestinations = [
  "https://www.aquira.art/",
  "https://www.aquira1978.com/",
  "https://www.aquira.org/",
];
const journeyCopy = {
  ja: {
    ariaLabel: "AQUIRAをめぐる3章",
    eyebrow: "AQUIRA JOURNEY <span>3つの公式サイトをめぐる</span>",
    chapters: ["作品と出会う", "起点をたどる", "対話へひらく"],
    destinations: ["作品・表現", "起点・記録", "公共的実践"],
    ariaLabels: ["第1章 作品と出会う — 作品・表現（現在地）", "第2章 起点をたどる — 起点・記録", "第3章 対話へひらく — 公共的実践"],
    current: "現在地",
  },
  en: {
    ariaLabel: "Three chapters of AQUIRA",
    eyebrow: "AQUIRA JOURNEY <span>Explore the three official sites</span>",
    chapters: ["Encounter the Work", "Trace the Origin", "Open to Dialogue"],
    destinations: ["Works &amp; Expression", "Origin &amp; Archive", "Public Practice"],
    ariaLabels: ["Chapter 01: Encounter the Work — Works &amp; Expression (Current chapter)", "Chapter 02: Trace the Origin — Origin &amp; Archive", "Chapter 03: Open to Dialogue — Public Practice"],
    current: "Current chapter",
  },
};

function assertJourneyRail(html, file, language) {
  const copy = journeyCopy[language];
  const rails = [...html.matchAll(/<nav class="journey-rail"[\s\S]*?<\/nav>/g)];
  if (rails.length !== 1) throw new Error(`${file}: expected exactly one journey rail, found ${rails.length}`);

  const rail = rails[0][0];
  if (!rail.startsWith(`<nav class="journey-rail" aria-label="${copy.ariaLabel}">`)) {
    throw new Error(`${file}: journey rail aria-label is missing or incorrect`);
  }
  if (!rail.includes(`<p class="journey-rail__eyebrow">${copy.eyebrow}</p>`)) {
    throw new Error(`${file}: journey rail eyebrow is missing or incorrect`);
  }

  const items = [...rail.matchAll(/<li class="journey-rail__item">([\s\S]*?)<\/li>/g)];
  if (items.length !== 3) throw new Error(`${file}: journey rail must contain exactly three items`);
  const hrefs = items.map((item) => item[1].match(/<a class="journey-rail__link" href="([^"]+)"/)?.[1]);
  if (JSON.stringify(hrefs) !== JSON.stringify(journeyDestinations)) {
    throw new Error(`${file}: journey rail canonical destination order is incorrect`);
  }

  for (const [index, item] of items.entries()) {
    const number = String(index + 1).padStart(2, "0");
    const markup = item[1];
    if (!markup.includes(`<span class="journey-rail__number" aria-hidden="true">${number}</span>`)) {
      throw new Error(`${file}: journey item ${number} number is missing or inaccessible`);
    }
    if (!markup.includes(`<span class="journey-rail__chapter">${copy.chapters[index]}</span>`)) {
      throw new Error(`${file}: journey item ${number} chapter copy is incorrect`);
    }
    if (!markup.includes(`<span class="journey-rail__destination">${copy.destinations[index]}</span>`)) {
      throw new Error(`${file}: journey item ${number} destination copy is incorrect`);
    }
    if (!markup.includes(`aria-label="${copy.ariaLabels[index]}"`)) {
      throw new Error(`${file}: journey item ${number} complete accessible label is missing or incorrect`);
    }
  }

  const currentLinks = [...rail.matchAll(/<a class="journey-rail__link"[^>]*aria-current="step"[^>]*>/g)];
  if (currentLinks.length !== 1 || !currentLinks[0][0].includes('href="https://www.aquira.art/"')) {
    throw new Error(`${file}: journey rail must mark only the art homepage as the current step`);
  }
  if (!items[0][1].includes(`<span class="journey-rail__current">${copy.current}</span>`)) {
    throw new Error(`${file}: current journey indicator copy is missing or incorrect`);
  }
  if (html.indexOf(rail) < html.indexOf("</header>") || html.indexOf(rail) > html.indexOf('<main id="main-content">')) {
    throw new Error(`${file}: journey rail must be immediately between the site header and main content`);
  }
}

for (const { file, canonical, type, language } of checks) {
  const html = await readFile(path.join(root, file), "utf8");
  if (!html.includes(`<html lang="${language}">`)) {
    throw new Error(`${file}: HTML language is missing or incorrect`);
  }
  if (!html.includes(`<link rel="canonical" href="${canonical}" />`)) {
    throw new Error(`${file}: canonical URL is missing or incorrect`);
  }
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`${file}: JSON-LD script is missing`);
  const schema = JSON.parse(match[1]);
  const graph = schema["@graph"] ?? [];
  if (!graph.some((item) => item["@type"] === type)) {
    throw new Error(`${file}: required ${type} schema is missing`);
  }
  if (!graph.some((item) => item["@type"] === "Person" && item.name === "Aquira")) {
    throw new Error(`${file}: Aquira Person entity is missing`);
  }
  if (!graph.some((item) => item["@type"] === "WebSite")) {
    throw new Error(`${file}: WebSite entity is missing`);
  }
  if (!html.includes('<body data-journey-stage="art">')) {
    throw new Error(`${file}: body journey stage is missing or incorrect`);
  }
  if (!html.includes(`<script src="/journey.js?v=${assetVersion}" defer></script>`)) {
    throw new Error(`${file}: deferred journey enhancement script is missing`);
  }
  assertJourneyRail(html, file, language);
}

await access(path.join(root, "journey.js"));
const journeyScript = await readFile(path.join(root, "journey.js"), "utf8");
for (const requiredBehavior of ["prefers-reduced-motion: reduce", "a11y-reduce-motion", "requestAnimationFrame"]) {
  if (!journeyScript.includes(requiredBehavior)) {
    throw new Error(`journey.js: required progressive-enhancement behavior is missing: ${requiredBehavior}`);
  }
}

const home = await readFile(path.join(root, "index.html"), "utf8");
const englishHomeVisual = await readFile(path.join(root, "en/index.html"), "utf8");
for (const [file, html] of [["index.html", home], ["en/index.html", englishHomeVisual]]) {
  if (!html.includes('class="hero hero--visual"') || !html.includes('src="/media/aquira-archive-interior.webp"') || !html.includes('srcset="/media/aquira-archive-interior-mobile.webp"') || !html.includes('alt="梁のある室内、カウンター、花、吊り下げ照明、右側に立つ人物を写したモノクロ写真"')) {
    throw new Error(`${file}: main visual picture, responsive source, or accessible alternative text is missing`);
  }
  if (!html.includes('<link rel="preload" as="image"') || !html.includes('fetchpriority="high"')) {
    throw new Error(`${file}: main visual preload is missing`);
  }
}
await access(path.join(root, "media/aquira-archive-interior.webp"));
await access(path.join(root, "media/aquira-archive-interior-mobile.webp"));
const homeChapterCards = [...home.matchAll(/<article class="official-network-card[^>]*\bdata-chapter-card\b[^>]*>/g)];
if (homeChapterCards.length !== 3) {
  throw new Error(`index.html: expected exactly three homepage chapter cards, found ${homeChapterCards.length}`);
}
for (const [index, card] of homeChapterCards.entries()) {
  const number = String(index + 1).padStart(2, "0");
  if (!card[0].includes(`data-journey-step="${number}"`)) {
    throw new Error(`index.html: chapter card ${number} journey step is missing or incorrect`);
  }
}
if (!homeChapterCards[0][0].includes("data-journey-current") || !home.includes("CHAPTER 01 · 作品と出会う <span>現在地</span>")) {
  throw new Error("index.html: current homepage chapter card indicator is missing or incorrect");
}
for (const { file } of checks.filter((check) => check.file !== "index.html")) {
  const html = await readFile(path.join(root, file), "utf8");
  if (html.includes("data-chapter-card")) throw new Error(`${file}: non-home page must not contain chapter cards`);
}

const stylesheet = await readFile(path.join(root, "styles.css"), "utf8");
const journeyStyles = await readFile(path.join(root, "styles/journey.css"), "utf8");
if (!stylesheet.includes('@import url("styles/journey.css");')) {
  throw new Error("styles.css: journey stylesheet import is missing");
}
for (const requiredRule of ["@media (max-width: 700px)", "@media (prefers-reduced-motion: reduce)", ".a11y-reduce-motion", "@media (forced-colors: active)"]) {
  if (!journeyStyles.includes(requiredRule)) throw new Error(`styles/journey.css: required journey rule is missing: ${requiredRule}`);
}

const japaneseHome = await readFile(path.join(root, "index.html"), "utf8");
const englishHome = await readFile(path.join(root, "en/index.html"), "utf8");
for (const html of [japaneseHome, englishHome]) {
  if (!html.includes('hreflang="ja" href="https://www.aquira.art/"') && !html.includes('href="https://www.aquira.art/" hreflang="ja"')) {
    throw new Error("localized home page: Japanese hreflang reference is missing");
  }
  if (!html.includes('hreflang="en" href="https://www.aquira.art/en/"') && !html.includes('href="https://www.aquira.art/en/" hreflang="en"')) {
    throw new Error("localized home page: English hreflang reference is missing");
  }
}

const robots = await readFile(path.join(root, "robots.txt"), "utf8");
for (const bot of ["GPTBot", "Google-Extended", "OAI-SearchBot", "ClaudeBot", "PerplexityBot"]) {
  if (!robots.includes(`User-agent: ${bot}\nAllow: /`)) throw new Error(`robots.txt: ${bot} allowance is missing`);
}
if (!robots.includes("User-agent: PetalBot\nDisallow: /")) {
  throw new Error("robots.txt: PetalBot block is missing");
}

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
for (const { canonical } of checks) {
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) throw new Error(`sitemap.xml: ${canonical} is missing`);
}

const officialNetwork = await readFile(path.join(root, "official-network/index.html"), "utf8");
for (const url of ["https://www.aquira.art/", "https://www.aquira1978.com/", "https://www.aquira.org/"]) {
  if (!officialNetwork.includes(url)) throw new Error(`official-network/index.html: missing official-domain link ${url}`);
}

for (const file of ["index.html", "official-network/index.html"]) {
  const html = await readFile(path.join(root, file), "utf8");
  for (const url of ["https://www.aquira.art/", "https://www.aquira1978.com/", "https://www.aquira.org/"]) {
    if (!html.includes(`<a class="official-network-card__link" href="${url}"`)) {
      throw new Error(`${file}: ${url} must be a full-card official-network link`);
    }
  }
}

const production = JSON.parse(await readFile(path.join(root, "ops/production.json"), "utf8"));
if (production.production_origin !== "https://www.aquira.art/") throw new Error("production.json: production origin is incorrect");
if (production.canonical_host !== "www.aquira.art") throw new Error("production.json: canonical host is incorrect");
if (production.deployment_mode !== "manual workflow dispatch") throw new Error("production.json: unexpected deployment mode");

console.log(`SEO validation passed: ${checks.length} canonical pages, bilingual metadata, JSON-LD, robots, and sitemap verified.`);
