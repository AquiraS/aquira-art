/**
 * AQUIRA 静的HTMLビルダー
 * SEO/AEO 方針: 可視本文・canonical・構造化データの事実を一致させる。
 * 実行: node scripts/build-site.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const contentPath = pathToFileURL(path.join(projectDirectory, "content", "site-content.js"));
const { default: content } = await import(`${contentPath.href}?updated=${Date.now()}`);
const buildDate = "2026-08-25";
const assetVersion = "20260825";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsonForHtml(value) {
  return JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");
}

function absoluteUrl(pathname) {
  return new URL(pathname, `${content.site.origin}/`).href;
}

function renderNavigation(navigation, pathname) {
  return navigation
    .map((item) => {
      const current = item.href === pathname ? ' aria-current="page"' : "";
      return `<a href="${escapeHtml(item.href)}"${current}>${escapeHtml(item.label)}</a>`;
    })
    .join("\n");
}
function renderHeader({ language = "ja", pathname = "/" } = {}) {
  const englishNavigation = [
    { label: "Artist profile", href: "/about/" },
    { label: "Works", href: "/works/" },
    { label: "Practice", href: "/practice/" },
  ];
  const navigation = language === "en" ? englishNavigation : content.navigation;
  const navigationLabel = language === "en" ? "Primary navigation" : "主要ナビゲーション";
  const homeLabel = language === "en" ? `${content.site.shortName} home` : `${content.site.name} ホーム`;
  const contactLabel = language === "en" ? "Contact" : "お問い合わせ";
  return `
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="${escapeHtml(homeLabel)}">${escapeHtml(content.site.shortName)}</a>
      <nav class="site-header__navigation" aria-label="${escapeHtml(navigationLabel)}">
        ${renderNavigation(navigation, pathname)}
      </nav>
      <a class="site-header__contact" href="${escapeHtml(content.contact.href)}">${escapeHtml(contactLabel)}</a>
    </header>`;
}
function renderFooter() {
  const socialLinks = content.entity.sameAs
    .map((url) => `<li><a href="${escapeHtml(url)}" rel="me noopener" target="_blank">${escapeHtml(new URL(url).hostname.replace("www.", ""))}</a></li>`)
    .join("");
  const officialLinks = content.officialNetwork.links
    .map((item) => `<li><a href="${escapeHtml(item.href)}"${item.internal ? "" : ' target="_blank" rel="noopener noreferrer"'}>${escapeHtml(item.label)}</a></li>`)
    .join("");
  return `
    <footer class="site-footer">
      <div class="site-footer__identity"><p class="site-footer__title">${escapeHtml(content.footer.title)}</p><p class="site-footer__description">${escapeHtml(content.footer.description)}</p></div>
      <nav class="site-footer__network" aria-label="Aquira公式エコシステム"><p>公式エコシステム</p><ul>${officialLinks}</ul></nav>
      <nav class="site-footer__links" aria-label="公式プロフィール・法定情報・お問い合わせ"><ul><li><a href="/accessibility/">アクセシビリティ</a></li><li><a href="${escapeHtml(content.footer.legalNotice.href)}">${escapeHtml(content.footer.legalNotice.label)}</a></li><li><a href="${escapeHtml(content.contact.href)}">${escapeHtml(content.contact.label)}</a></li>${socialLinks}</ul></nav>
      <p class="site-footer__meta">公式情報の最終更新: <time datetime="${buildDate}">${buildDate}</time></p>
    </footer>`;
}

function personSchema({ language = "ja" } = {}) {
  const isEnglish = language === "en";
  return {
    "@type": "Person",
    "@id": `${content.site.origin}/#aquira`,
    name: content.entity.name,
    alternateName: content.entity.alternateName,
    jobTitle: isEnglish ? content.entity.jobTitleEnglish : content.entity.jobTitle,
    description: isEnglish ? content.entity.descriptionEnglish : content.entity.description,
    homeLocation: { "@type": "Place", name: isEnglish ? content.entity.locationEnglish : content.entity.location },
    url: `${content.site.origin}/about/`,
    sameAs: content.entity.sameAs,
  };
}

function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${content.site.origin}/#website`,
    url: `${content.site.origin}/`,
    name: content.site.name,
    alternateName: content.site.shortName,
    inLanguage: ["ja-JP", "en"],
    publisher: { "@id": `${content.site.origin}/#aquira` },
  };
}

function pageSchema({ pathname, title, description, language = "ja-JP", type = "WebPage", additional = {} }) {
  return {
    "@type": type,
    "@id": `${absoluteUrl(pathname)}#webpage`,
    url: absoluteUrl(pathname),
    name: title,
    description,
    inLanguage: language,
    isPartOf: { "@id": `${content.site.origin}/#website` },
    about: { "@id": `${content.site.origin}/#aquira` },
    mainEntity: { "@id": `${content.site.origin}/#aquira` },
    dateModified: buildDate,
    ...additional,
  };
}

function renderLanguageAlternates(pathname) {
  const canonical = absoluteUrl(pathname);
  if (pathname === "/" || pathname === "/en/") {
    return `
      <link rel="alternate" href="${escapeHtml(absoluteUrl("/"))}" hreflang="ja" />
      <link rel="alternate" href="${escapeHtml(absoluteUrl("/en/"))}" hreflang="en" />
      <link rel="alternate" href="${escapeHtml(absoluteUrl("/"))}" hreflang="x-default" />`;
  }
  return `
      <link rel="alternate" href="${escapeHtml(canonical)}" hreflang="ja" />
      <link rel="alternate" href="${escapeHtml(canonical)}" hreflang="x-default" />`;
}

function renderHead({ pathname, title, description, schema, language = "ja" }) {
  const canonical = absoluteUrl(pathname);
  const isEnglish = language === "en";
  return `
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="${escapeHtml(description)}" />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <meta name="author" content="${escapeHtml(content.site.name)}" />
      <meta name="theme-color" content="#101010" />
      <title>${escapeHtml(title)}</title>
      <link rel="canonical" href="${escapeHtml(canonical)}" />
      ${renderLanguageAlternates(pathname)}
      <link rel="stylesheet" href="/styles.css?v=${assetVersion}" />
      <script src="/accessibility.js?v=${assetVersion}" defer></script>
      <meta property="og:locale" content="${isEnglish ? "en_US" : "ja_JP"}" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="${escapeHtml(content.site.name)}" />
      <meta property="og:title" content="${escapeHtml(title)}" />
      <meta property="og:description" content="${escapeHtml(description)}" />
      <meta property="og:url" content="${escapeHtml(canonical)}" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="${escapeHtml(title)}" />
      <meta name="twitter:description" content="${escapeHtml(description)}" />
      <script type="application/ld+json">${jsonForHtml({ "@context": "https://schema.org", "@graph": schema })}</script>
    </head>`;
}

function renderAccessibilityTools({ language = "ja" } = {}) {
  const copy = language === "en"
    ? { trigger: "Display settings", title: "Display settings", close: "Close", smaller: "Smaller text", larger: "Larger text", contrast: "High contrast", underline: "Underline links", motion: "Reduce motion", reset: "Reset", page: "Accessibility information" }
    : { trigger: "表示設定", title: "表示設定", close: "閉じる", smaller: "文字を小さく", larger: "文字を大きく", contrast: "高コントラスト", underline: "リンクに下線", motion: "動きを抑える", reset: "初期状態に戻す", page: "アクセシビリティに関する情報" };
  return `
    <div class="a11y-tools">
      <button class="a11y-tools__trigger" type="button" data-a11y-trigger aria-expanded="false" aria-controls="a11y-panel">${escapeHtml(copy.trigger)}</button>
      <section class="a11y-tools__panel" id="a11y-panel" data-a11y-panel role="dialog" aria-modal="false" aria-labelledby="a11y-panel-title" hidden>
        <div class="a11y-tools__panel-header"><h2 id="a11y-panel-title">${escapeHtml(copy.title)}</h2><button class="a11y-tools__close" type="button" data-a11y-close aria-label="${escapeHtml(copy.close)}">×</button></div>
        <p>お使いの端末に合わせて、読みやすさや動きの量を調整できます。</p>
        <div class="a11y-tools__actions"><button type="button" data-a11y-action="font-decrease">A− ${escapeHtml(copy.smaller)}</button><button type="button" data-a11y-action="font-increase">A＋ ${escapeHtml(copy.larger)}</button><button type="button" data-a11y-action="contrast" aria-pressed="false">${escapeHtml(copy.contrast)}</button><button type="button" data-a11y-action="underline" aria-pressed="false">${escapeHtml(copy.underline)}</button><button type="button" data-a11y-action="motion" aria-pressed="false">${escapeHtml(copy.motion)}</button><button type="button" data-a11y-action="reset">${escapeHtml(copy.reset)}</button></div>
        <a class="text-link" href="/accessibility/">${escapeHtml(copy.page)}</a>
      </section>
      <p class="visually-hidden" data-a11y-status aria-live="polite" aria-atomic="true"></p>
    </div>`;
}

function renderLayout({ pathname, title, description, schema, main, language = "ja" }) {
  const skipLabel = language === "en" ? "Skip to content" : "本文へ移動";
  return `<!doctype html>
<!-- AQUIRA style: Artist Evidence Atlas — visible facts, clear hierarchy, generous editorial whitespace. -->
<html lang="${escapeHtml(language)}">
  ${renderHead({ pathname, title, description, schema, language })}
  <body>
    <a class="skip-link" href="#main-content">${escapeHtml(skipLabel)}</a>
    ${renderHeader({ language, pathname })}
    <main id="main-content">${main}</main>
    ${renderFooter()}
    ${renderAccessibilityTools({ language })}
  </body>
</html>`;
}

function renderSectionHeading(eyebrow, title, id = "") {
  const idAttribute = id ? ` id="${escapeHtml(id)}"` : "";
  return `<div class="section__heading"><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2${idAttribute}>${escapeHtml(title)}</h2></div>`;
}

function renderIdentityFacts() {
  return `<dl class="identity-facts">${content.identityFacts
    .map((fact) => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`)
    .join("")}</dl>`;
}

function renderWorkCards(items) {
  return `<div class="work-list">${items
    .map(
      (work) => `<article class="work-card"><a class="work-card__link" href="/works/" aria-label="${escapeHtml(work.title)}の作品領域を見る"><p class="work-card__number">${escapeHtml(work.number)}</p><h3>${escapeHtml(work.title)}</h3><p class="work-card__description">${escapeHtml(work.description)}</p><span>作品領域を見る →</span></a></article>`,
    )
    .join("")}</div>`;
}

function renderOfficialNetworkCards() {
  return `<div class="official-network-grid">${content.officialNetwork.links
    .map((item, index) => `<article class="official-network-card"><p class="official-network-card__number">0${index + 1}</p><h3>${escapeHtml(item.label)}</h3><p>${escapeHtml(item.description)}</p><a class="text-link" href="${escapeHtml(item.href)}"${item.internal ? "" : ' target="_blank" rel="noopener noreferrer"'}>${escapeHtml(item.internal ? "このサイトを見る" : "公式サイトを見る")} →</a></article>`)
    .join("")}</div>`;
}

function renderLegalText(value) {
  return escapeHtml(value).replaceAll(
    "aquirae@me.com",
    '<a href="mailto:aquirae@me.com">aquirae@me.com</a>',
  );
}

function renderLegalDisclosure(entries) {
  return `<dl class="legal-disclosure">${entries
    .map((entry) => {
      const paragraphs = entry.paragraphs
        .map((paragraph, index) => {
          const body = index === 0 && entry.href
            ? `<a href="${escapeHtml(entry.href)}"${entry.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(paragraph)}</a>`
            : renderLegalText(paragraph);
          return `<p>${body}</p>`;
        })
        .join("");
      return `<div class="legal-disclosure__item"><dt>${escapeHtml(entry.label)}</dt><dd>${paragraphs}</dd></div>`;
    })
    .join("")}</dl>`;
}

function renderValueCards(items, { numbered = false } = {}) {
  return `<div class="value-grid">${items
    .map(
      (item, index) => `<article class="value-card">${numbered ? `<p class="value-card__index">${String(index + 1).padStart(2, "0")}</p>` : ""}<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`,
    )
    .join("")}</div>`;
}

const homeTitle = `${content.site.name} | 横浜の写真家・現代アーティスト`;
const homeMain = `
  <section class="hero" aria-labelledby="hero-title">
    <p class="eyebrow">${escapeHtml(content.hero.eyebrow)}</p>
    <h1 id="hero-title">${escapeHtml(content.hero.title)}</h1>
    <p class="lead">${escapeHtml(content.hero.description)}</p>
    <div class="hero__actions">
      <a class="button button--primary" href="${escapeHtml(content.hero.button.href)}">${escapeHtml(content.hero.button.label)}</a>
      <a class="button button--secondary" href="${escapeHtml(content.contact.href)}">${escapeHtml(content.contact.label)}</a>
    </div>
  </section>
  <section class="section" aria-labelledby="identity-title">
    ${renderSectionHeading("AT A GLANCE", "Aquira（アキラ）について", "identity-title")}
    <p class="statement">${escapeHtml(content.entity.description)}</p>
    ${renderIdentityFacts()}
  </section>
  <section class="section section--muted" aria-labelledby="works-title">
    ${renderSectionHeading(content.works.eyebrow, content.works.title, "works-title")}
    <p class="statement">${escapeHtml(content.works.summary)}</p>
    ${renderWorkCards(content.works.items)}
    <a class="text-link" href="/works/">作品領域の詳細を見る</a>
  </section>
  <section class="section" aria-labelledby="practice-title">
    ${renderSectionHeading(content.practice.eyebrow, content.practice.title, "practice-title")}
    <p class="statement">${escapeHtml(content.practice.summary)}</p>
    <a class="text-link" href="/practice/">活動と協働について知る</a>
  </section>
  <section class="section section--muted" aria-labelledby="official-network-title">
    ${renderSectionHeading(content.officialNetwork.eyebrow, content.officialNetwork.title, "official-network-title")}
    <p class="statement">${escapeHtml(content.officialNetwork.summary)}</p>
    ${renderOfficialNetworkCards()}
    <a class="text-link" href="${escapeHtml(content.officialNetwork.href)}">${escapeHtml(content.officialNetwork.label)}</a>
  </section>
  <section class="section section--contact" aria-labelledby="contact-title">
    ${renderSectionHeading(content.contact.eyebrow, content.contact.title, "contact-title")}
    <p class="statement">${escapeHtml(content.contact.description)}</p>
    <a class="button button--primary" href="${escapeHtml(content.contact.href)}">${escapeHtml(content.contact.buttonLabel)}</a>
  </section>`;

const homeSchema = [
  websiteSchema(),
  personSchema(),
  pageSchema({ pathname: "/", title: homeTitle, description: content.site.description }),
];

const aboutTitle = `Aquiraについて | ${content.site.titleSuffix}`;
const aboutDescription = `${content.entity.name}の公式プロフィール。${content.entity.jobTitle}としての活動領域、拠点、創作と社会との関係を紹介します。`;
const aboutMain = `
  <section class="hero hero--compact" aria-labelledby="about-title">
    <p class="eyebrow">${escapeHtml(content.about.eyebrow)}</p>
    <h1 id="about-title">${escapeHtml(content.about.title)}</h1>
    <p class="lead">${escapeHtml(content.about.summary)}</p>
  </section>
  <section class="section" aria-labelledby="profile-facts-title">
    ${renderSectionHeading("IDENTITY", "公式プロフィール", "profile-facts-title")}
    ${renderIdentityFacts()}
  </section>
  <section class="section section--muted" aria-label="Aquiraの創作活動">
    <div class="prose-list">${content.about.sections
      .map((section) => `<article><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.text)}</p></article>`)
      .join("")}</div>
  </section>`;
const aboutSchema = [
  websiteSchema(),
  personSchema(),
  pageSchema({
    pathname: "/about/",
    title: aboutTitle,
    description: aboutDescription,
    type: "ProfilePage",
    additional: { dateCreated: buildDate, dateModified: buildDate },
  }),
];

const worksTitle = `作品領域 | ${content.site.titleSuffix}`;
const worksDescription = "Aquira（アキラ）の作品領域。写真、現代アート、デジタル表現を横断する制作の視点とテーマを紹介します。";
const worksMain = `
  <section class="hero hero--compact" aria-labelledby="works-title">
    <p class="eyebrow">${escapeHtml(content.works.eyebrow)}</p>
    <h1 id="works-title">${escapeHtml(content.works.title)}</h1>
    <p class="lead">${escapeHtml(content.works.summary)}</p>
  </section>
  <section class="section" aria-label="Aquiraの作品領域">
    ${renderWorkCards(content.works.items)}
  </section>
  <section class="section section--muted" aria-labelledby="works-context-title">
    ${renderSectionHeading("CONTEXT", "作品を読むための手がかり", "works-context-title")}
    <p class="statement">Aquiraの作品では、人物、都市、風景、光と場所の関係を手がかりに、記憶と現在の間にある感覚を見つめます。各作品の制作年、媒体、展示・発表の記録は、確認済みの情報から順次公開します。</p>
  </section>`;
const worksSchema = [
  websiteSchema(),
  personSchema(),
  pageSchema({
    pathname: "/works/",
    title: worksTitle,
    description: worksDescription,
    type: "CollectionPage",
    additional: {
      mainEntity: {
        "@type": "ItemList",
        itemListElement: content.works.items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@type": "Thing", name: item.title, description: item.description },
        })),
      },
    },
  }),
];

const practiceTitle = `活動と協働 | ${content.site.titleSuffix}`;
const practiceDescription = "Aquira（アキラ）の活動と協働。創作チャレンジ、対話、学びの場、共同プロジェクトに関する公式情報です。";
const practiceMain = `
  <section class="hero hero--compact" aria-labelledby="practice-title">
    <p class="eyebrow">${escapeHtml(content.practice.eyebrow)}</p>
    <h1 id="practice-title">${escapeHtml(content.practice.title)}</h1>
    <p class="lead">${escapeHtml(content.practice.summary)}</p>
  </section>
  <section class="section" aria-label="活動と協働の内容">
    <div class="prose-list">${content.practice.pillars
      .map((item) => `<article><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></article>`)
      .join("")}</div>
  </section>`;
const practiceSchema = [
  websiteSchema(),
  personSchema(),
  pageSchema({
    pathname: "/practice/",
    title: practiceTitle,
    description: practiceDescription,
    type: "CollectionPage",
  }),
];

const officialNetworkTitle = `Aquira公式エコシステム | ${content.site.titleSuffix}`;
const officialNetworkDescription = "Aquiraの公式サイト群。作品・表現、起点・記録、公共的実践という3つの役割と入口を案内します。";
const officialNetworkMain = `
  <section class="hero hero--compact" aria-labelledby="official-network-page-title">
    <p class="eyebrow">${escapeHtml(content.officialNetwork.eyebrow)}</p>
    <h1 id="official-network-page-title">${escapeHtml(content.officialNetwork.title)}</h1>
    <p class="lead">${escapeHtml(content.officialNetwork.summary)}</p>
  </section>
  <section class="section" aria-label="3つの公式サイト">
    ${renderOfficialNetworkCards()}
  </section>`;
const officialNetworkSchema = [
  websiteSchema(),
  personSchema(),
  pageSchema({
    pathname: "/official-network/",
    title: officialNetworkTitle,
    description: officialNetworkDescription,
    additional: {
      mainEntity: {
        "@type": "ItemList",
        name: "Aquira公式エコシステム",
        itemListElement: content.officialNetwork.links.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          url: item.href,
        })),
      },
    },
  }),
];

const licensingTitle = `利用許諾のご相談 | ${content.site.titleSuffix}`;
const licensingDescription = "Aquira（アキラ）の作品、画像、映像、制作物、公式表記の利用に関する相談窓口と手続を案内します。";
const licensingMain = `
  <section class="hero hero--compact" aria-labelledby="licensing-title">
    <p class="eyebrow">${escapeHtml(content.licensing.eyebrow)}</p>
    <h1 id="licensing-title">${escapeHtml(content.licensing.title)}</h1>
    <p class="lead">${escapeHtml(content.licensing.summary)}</p>
  </section>
  <section class="section" aria-label="利用許諾の対象">
    ${renderSectionHeading("SCOPE", "ご相談いただける内容")}
    <div class="prose-list">${content.licensing.scopes
      .map((item) => `<article><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></article>`)
      .join("")}</div>
  </section>
  <section class="section section--muted" aria-label="利用許諾の相談手順">
    ${renderSectionHeading("PROCESS", "ご相談から合意まで")}
    <div class="prose-list">${content.licensing.consultation
      .map((item) => `<article><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></article>`)
      .join("")}</div>
  </section>`;
const licensingSchema = [
  websiteSchema(),
  personSchema(),
  pageSchema({
    pathname: "/licensing/",
    title: licensingTitle,
    description: licensingDescription,
  }),
];

const policyTitle = `Aquira Policy｜コア原則 | ${content.site.titleSuffix}`;
const policyDescription = "Aquiraが大切にするコア原則。自由・快適さ・心の余白を、時間やお金より上位に置き、心身の安全と長期的な信頼を守る創造と協働を考えます。";
const policyMain = `
  <section class="hero hero--compact" aria-labelledby="policy-title">
    <p class="eyebrow">${escapeHtml(content.policy.eyebrow)}</p>
    <h1 id="policy-title">${escapeHtml(content.policy.title)}</h1>
    <p class="lead">${escapeHtml(content.policy.summary)}</p>
  </section>
  <section class="section section--muted" aria-labelledby="policy-priority-title">
    ${renderSectionHeading("FIRST PRINCIPLE", "何を大切にするかを、先に決める。", "policy-priority-title")}
    <p class="statement">Aquiraの提案と意思決定には、明確な順序があります。時間やお金は大切な資源です。ただし、それらは、自由で穏やかな生活と、心身の安全が守られてはじめて意味を持ちます。この順序を曖昧にしないことが、創造性と信頼を長く育てる土台になると考えています。</p>
    <ol class="priority-list" aria-label="Aquiraの意思決定における優先順位">${content.policy.priority
      .map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(item)}</li>`)
      .join("")}</ol>
  </section>
  <section class="section" aria-labelledby="policy-sanctuary-title">
    ${renderSectionHeading("SANCTUARY", "心身の安全は、すべての表現の前提です。", "policy-sanctuary-title")}
    <p class="statement">収益、効率、成長は目的そのものではありません。心身聖域と尊厳を守れる範囲で、はじめて意味を持つものです。</p>
    ${renderValueCards(content.policy.sanctuary, { numbered: true })}
  </section>
  <section class="section section--muted" aria-labelledby="policy-judgment-title">
    ${renderSectionHeading("INDEPENDENT JUDGMENT", "いまだけを見ず、過去と未来を重ねて考える。", "policy-judgment-title")}
    <p class="statement">Aquiraは、多数派の意見や一時的な流行に、そのまま答えを委ねません。過去に積み重ねられた文脈、いま目の前にある制約、そして未来に残る影響を重ね、必要な優先順位を明らかにします。</p>
    ${renderValueCards(content.policy.judgment)}
  </section>
  <section class="section" aria-labelledby="policy-invitation-title">
    ${renderSectionHeading("A QUIET INVITATION", "急がず、まず対話から。", "policy-invitation-title")}
    <p class="statement">作品、協働、学び、あるいはまだ言葉になっていない構想について。Aquiraは、相手の時間と心の余白を尊重する対話を大切にします。目的や条件が固まっていなくても、静かな相談から始めていただけます。</p>
    <a class="button button--primary" href="/practice/">活動と協働について知る</a>
  </section>`;
const policySchema = [
  websiteSchema(),
  personSchema(),
  pageSchema({ pathname: "/policy/", title: policyTitle, description: policyDescription }),
];

const ecosystemTitle = `Aquira Ecosystem｜美と静けさの実践 | ${content.site.titleSuffix}`;
const ecosystemDescription = "Aquiraは、作品、知識、表現、技術、顧客理解、制作力を積み重ねる資産と考えます。美と静けさを起点に、独自性と長期的な信頼を育てる創造の場です。";
const ecosystemMain = `
  <section class="hero hero--compact" aria-labelledby="ecosystem-title">
    <p class="eyebrow">${escapeHtml(content.ecosystem.eyebrow)}</p>
    <h1 id="ecosystem-title">${escapeHtml(content.ecosystem.title)}</h1>
    <p class="lead">${escapeHtml(content.ecosystem.summary)}</p>
  </section>
  <section class="section" aria-labelledby="capabilities-title">
    ${renderSectionHeading("BUILDING IN-HOUSE CAPABILITIES", "自分の目で見て、自分の言葉で選ぶ。", "capabilities-title")}
    <p class="statement">ツール、AI、外部との協働は、可能性を広げる大切な手段です。一方で、判断の中心を外に預けないことも同じくらい大切です。Aquiraは、知識と表現、ブランドと技術、顧客理解と制作力を、独自性と再現性を高めるための基盤として育てます。</p>
    ${renderValueCards(content.ecosystem.capabilities, { numbered: true })}
  </section>
  <section class="section section--muted" aria-labelledby="values-title">
    ${renderSectionHeading("ART × DESIGN THINKING", "感じることと、整えることの間に答えを探す。", "values-title")}
    <p class="statement">Aquiraの創造は、感性だけにも、効率だけにも寄りません。美しいと感じること、心が動くこと、日々のなかで使えること、文化的な意味を持つこと。それぞれを丁寧に見つめ、長く手元に残る価値へと整えていきます。</p>
    ${renderValueCards(content.ecosystem.values)}
  </section>
  <section class="section" aria-labelledby="gentle-design-title">
    ${renderSectionHeading("GENTLE DESIGN", "選ぶことを、少し軽やかに。", "gentle-design-title")}
    <p class="statement">美意識の高い方、コレクター、文化やウェルビーイングに関心のある方、そして感受性が豊かな方が、無理なく立ち寄れる場を目指しています。Aquiraは、情報量や刺激を増やすのではなく、理解しやすく、心地よく、信頼の置ける導線を整えます。</p>
    ${renderValueCards(content.ecosystem.principles)}
  </section>
  <section class="section section--muted" aria-labelledby="ecosystem-invitation-title">
    ${renderSectionHeading("WAYS TO CONNECT", "作品から、対話へ。対話から、次の表現へ。", "ecosystem-invitation-title")}
    <p class="statement">Aquiraのエコシステムは、ひとつの正解へ導くためのものではありません。作品を観ること、考えを読むこと、学びや対話に触れることを通して、それぞれが自分の速度で、次の視点を見つけられるようにするための場です。</p>
    <div class="prose-list">
      <article><h2>作品と余韻</h2><p>光、場所、時間をめぐる表現に触れる入口です。<a class="text-link" href="/works/">作品を見る</a></p></article>
      <article><h2>記録と学び</h2><p>観察、制作、対話から生まれる考えをたどる入口です。<a class="text-link" href="https://note.com/aquira" rel="noopener noreferrer" target="_blank">記録を読む</a></p></article>
      <article><h2>協働と相談</h2><p>アイデアや条件が未整理の段階から、静かに話す入口です。<a class="text-link" href="/practice/">活動と協働を見る</a></p></article>
    </div>
  </section>`;
const ecosystemSchema = [
  websiteSchema(),
  personSchema(),
  pageSchema({ pathname: "/ecosystem/", title: ecosystemTitle, description: ecosystemDescription }),
];

const faqTitle = `よくある質問 | ${content.site.titleSuffix}`;
const faqDescription = "Aquira（アキラ）の活動領域、拠点、作品、協働に関する公式のよくある質問です。";
const faqMain = `
  <section class="hero hero--compact" aria-labelledby="faq-title">
    <p class="eyebrow">OFFICIAL FAQ</p>
    <h1 id="faq-title">よくある質問</h1>
    <p class="lead">Aquiraの活動、作品、協働について、公式サイトで確認できる基本情報をまとめました。</p>
  </section>
  <section class="section" aria-label="よくある質問と回答">
    <div class="faq-list">${content.faq
      .map(
        (item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`,
      )
      .join("")}</div>
  </section>`;
const faqSchema = [
  websiteSchema(),
  personSchema(),
  pageSchema({ pathname: "/faq/", title: faqTitle, description: faqDescription }),
  {
    "@type": "FAQPage",
    "@id": `${absoluteUrl("/faq/")}#faq`,
    mainEntity: content.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
];

const englishPathname = "/en/";
const englishTitle = content.english.title;
const englishDescription =
  "Official website for Aquira, a Yokohama-based photographer, audiovisual artist, and contemporary artist working across photography, moving image, and digital expression.";
const englishMain = `
  <section class="hero" aria-labelledby="english-home-title">
    <p class="eyebrow">${escapeHtml(content.english.eyebrow)}</p>
    <h1 id="english-home-title">${escapeHtml(content.english.headline)}</h1>
    <p class="lead">${escapeHtml(content.english.introduction)}</p>
    <a class="button button--primary" href="/about/">View artist profile</a>
  </section>
  <section class="section" aria-labelledby="english-identity-title">
    ${renderSectionHeading("OFFICIAL IDENTITY", content.english.identityTitle, "english-identity-title")}
    <p class="statement">${escapeHtml(content.english.identityText)}</p>
  </section>
  <section class="section section--muted" aria-labelledby="english-practice-title">
    ${renderSectionHeading("SELECTED PRACTICE", content.english.practiceTitle, "english-practice-title")}
    <p class="statement">${escapeHtml(content.english.practiceText)}</p>
  </section>
  <section class="section" aria-labelledby="english-distinction-title">
    ${renderSectionHeading("NAME CLARIFICATION", content.english.distinctionTitle, "english-distinction-title")}
    <p class="statement">${escapeHtml(content.english.distinctionText)}</p>
  </section>
  <section class="section section--muted" aria-labelledby="english-licensing-title">
    ${renderSectionHeading("LICENSING & PERMISSIONS", content.english.licensingTitle, "english-licensing-title")}
    <p class="statement">${escapeHtml(content.english.licensingText)}</p>
    <a class="text-link" href="/licensing/">View licensing information</a>
  </section>`;
const englishSchema = [
  websiteSchema(),
  personSchema({ language: "en" }),
  pageSchema({
    pathname: englishPathname,
    title: englishTitle,
    description: englishDescription,
    language: "en",
  }),
];

const tokushohoTitle = `特定商取引法に基づく表記 | ${content.site.titleSuffix}`;
const tokushohoDescription = "Aquira（アキラ）の商品の販売条件、支払い方法、発送、返品・交換に関する特定商取引法に基づく表記です。";
const tokushohoMain = `
  <section class="hero hero--compact" aria-labelledby="tokushoho-title">
    <p class="eyebrow">${escapeHtml(content.tokushoho.eyebrow)}</p>
    <h1 id="tokushoho-title">${escapeHtml(content.tokushoho.title)}</h1>
    <p class="lead">${escapeHtml(content.tokushoho.summary)}</p>
  </section>
  <section class="section" aria-label="特定商取引法に基づく表記の詳細">
    ${renderLegalDisclosure(content.tokushoho.entries)}
  </section>`;
const tokushohoSchema = [
  websiteSchema(),
  personSchema(),
  pageSchema({ pathname: "/tokushoho/", title: tokushohoTitle, description: tokushohoDescription }),
];

const accessibilityTitle = `アクセシビリティ | ${content.site.titleSuffix}`;
const accessibilityDescription = "Aquira（アキラ）公式サイトのアクセシビリティに関する取り組み、表示設定、連絡方法をご案内します。";
const accessibilityMain = `
  <section class="hero hero--compact" aria-labelledby="accessibility-title">
    <p class="eyebrow">ACCESSIBILITY</p>
    <h1 id="accessibility-title">誰もが、無理なく読めるために。</h1>
    <p class="lead">Aquiraは、できる限り多くの方が、端末や環境にかかわらず作品と情報にアクセスできることを大切にしています。</p>
  </section>
  <section class="section" aria-labelledby="accessibility-tools-title">
    ${renderSectionHeading("DISPLAY SETTINGS", "このサイトで調整できる表示", "accessibility-tools-title")}
    <div class="prose-list"><article><h2>文字とコントラスト</h2><p>画面右下の「表示設定」から、文字サイズ、高コントラスト、リンクの下線表示を選べます。設定はお使いのブラウザーに保存されます。</p></article><article><h2>動きを抑える</h2><p>動きを抑える設定を選ぶと、画面上のアニメーションや遷移の動きを最小限にします。端末の「視差効果を減らす」設定にも対応します。</p></article></div>
  </section>
  <section class="section section--muted" aria-labelledby="accessibility-commitment-title">
    ${renderSectionHeading("OUR COMMITMENT", "継続して改善する項目", "accessibility-commitment-title")}
    <div class="prose-list"><article><h2>キーボード操作と構造</h2><p>キーボードだけで主要な情報と操作に到達できること、見出し・リンク・ランドマークが内容の構造を伝えることを確認しています。</p></article><article><h2>視覚情報の代替</h2><p>意味を持つ画像には代替テキストを付け、装飾のみの画像は読み上げ対象から除外します。映像を掲載する場合は、内容に応じて字幕や文字起こしの提供を検討します。</p></article><article><h2>確認とご連絡</h2><p>問題や改善のご提案がある場合は、状況、使用端末・ブラウザー、ページURLを添えてお問い合わせください。内容を確認し、合理的な範囲で対応します。</p></article></div>
    <a class="button button--primary" href="${escapeHtml(content.contact.href)}">アクセシビリティに関するお問い合わせ</a>
  </section>`;
const accessibilitySchema = [websiteSchema(), personSchema(), pageSchema({ pathname: "/accessibility/", title: accessibilityTitle, description: accessibilityDescription })];

const pages = [
  { pathname: "/", output: "index.html", title: homeTitle, description: content.site.description, schema: homeSchema, main: homeMain },
  { pathname: "/accessibility/", output: "accessibility/index.html", title: accessibilityTitle, description: accessibilityDescription, schema: accessibilitySchema, main: accessibilityMain },
  { pathname: "/tokushoho/", output: "tokushoho/index.html", title: tokushohoTitle, description: tokushohoDescription, schema: tokushohoSchema, main: tokushohoMain },
  { pathname: "/about/", output: "about/index.html", title: aboutTitle, description: aboutDescription, schema: aboutSchema, main: aboutMain },
  { pathname: "/policy/", output: "policy/index.html", title: policyTitle, description: policyDescription, schema: policySchema, main: policyMain },
  { pathname: "/ecosystem/", output: "ecosystem/index.html", title: ecosystemTitle, description: ecosystemDescription, schema: ecosystemSchema, main: ecosystemMain },
  { pathname: "/works/", output: "works/index.html", title: worksTitle, description: worksDescription, schema: worksSchema, main: worksMain },
  { pathname: "/practice/", output: "practice/index.html", title: practiceTitle, description: practiceDescription, schema: practiceSchema, main: practiceMain },
  { pathname: "/official-network/", output: "official-network/index.html", title: officialNetworkTitle, description: officialNetworkDescription, schema: officialNetworkSchema, main: officialNetworkMain },
  { pathname: "/licensing/", output: "licensing/index.html", title: licensingTitle, description: licensingDescription, schema: licensingSchema, main: licensingMain },
  { pathname: "/faq/", output: "faq/index.html", title: faqTitle, description: faqDescription, schema: faqSchema, main: faqMain },
  { pathname: englishPathname, output: "en/index.html", title: englishTitle, description: englishDescription, schema: englishSchema, main: englishMain, language: "en" },
];

await Promise.all(
  pages.map(async (page) => {
    const outputPath = path.join(projectDirectory, page.output);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${renderLayout(page).replace(/[ \t]+$/gm, "").trim()}\n`, "utf8");
  }),
);

const sitemapUrls = pages
  .map((page) => `  <url>\n    <loc>${absoluteUrl(page.pathname)}</loc>\n    <lastmod>${buildDate}</lastmod>\n  </url>`)
  .join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>
`;
const robots = `User-agent: *
Allow: /

User-agent: PetalBot
Disallow: /

User-agent: GPTBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: CCBot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bytespider
Allow: /

Sitemap: ${content.site.origin}/sitemap.xml
`;

await Promise.all([
  writeFile(path.join(projectDirectory, "sitemap.xml"), sitemap, "utf8"),
  writeFile(path.join(projectDirectory, "robots.txt"), robots, "utf8"),
]);

console.log(`AQUIRA SEO/AEO HTMLを生成しました: ${pages.length}ページ、robots.txt、sitemap.xml`);
