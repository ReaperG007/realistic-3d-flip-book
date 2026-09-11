import JSZip from "jszip";
import { PAGE_PRESETS, FLIP_SPEEDS, DEFAULT_FLIP_SPEED, type FlipSpeed, type Session, type Block, type BookPage } from "../book/model";

// ------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escUrlForCssAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isColorDark(hexColor?: string): boolean {
  if (!hexColor) return false;
  let hex = hexColor.replace("#", "").trim();
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "playbook"
  );
}

// ------------------------------------------------------------------
// block → HTML (static, no chart.js runtime)
// ------------------------------------------------------------------

const gs = (v: unknown, d = ""): string => (typeof v === "string" ? v : d);
const gn = (v: unknown, d = 0): number => (typeof v === "number" ? v : d);
const garr = <T,>(v: unknown, d: T[] = []): T[] => (Array.isArray(v) ? (v as T[]) : d);
const gbool = (v: unknown): boolean => v === true;

const NET_GLYPH_HTML: Record<string, string> = {
  Twitter: "𝕏",
  Facebook: "f",
  LinkedIn: "in",
  Instagram: "◉",
  GitHub: "gh",
  Email: "✉",
  YouTube: "►",
};

function starsHtml(nn: number): string {
  return "★★★★★".slice(0, Math.max(0, Math.min(5, nn))) + "☆☆☆☆☆".slice(0, 5 - Math.max(0, Math.min(5, nn)));
}

/** Static snapshot of a generic (Elementor-style) element — no JS interactivity, full visual parity. */
function renderGenericBlock(block: Block): string {
  const d = block.data as Record<string, unknown>;
  switch (block.type) {
    case "flexContainer": {
      const items = garr<string>(d.items);
      return `<div class="rm-flex" style="flex-direction:${gs(d.direction, "row")};gap:${gn(d.gap, 12)}px;align-items:${gs(d.align, "stretch")};justify-content:${gs(d.justify, "flex-start")}">${items.map((it) => `<div class="rm-flex-cell">${esc(it)}</div>`).join("")}</div>`;
    }
    case "innerSection": {
      const items = garr<string>(d.items);
      return `<div class="rm-inner-section" style="grid-template-columns:repeat(${gn(d.columns, 2)},1fr)">${items.map((it) => `<div class="rm-inner-col">${esc(it)}</div>`).join("")}</div>`;
    }
    case "button":
      return `<div class="rm-btn-wrap" style="text-align:${gs(d.align, "left")}"><a class="rm-button rm-button-${gs(d.style, "solid")}" href="${esc(gs(d.href, "#"))}" onclick="return false">${esc(gs(d.text, "Button"))}</a></div>`;
    case "spacer":
      return `<div class="rm-spacer" style="height:${gn(d.height, 32)}px" aria-hidden="true"></div>`;
    case "gmap":
      return `<figure class="rm-media rm-embed"><iframe title="map" loading="lazy" src="https://www.google.com/maps?q=${encodeURIComponent(gs(d.query, "New York"))}&z=${gn(d.zoom, 12)}&output=embed"></iframe></figure>`;
    case "youtube":
      return `<figure class="rm-media rm-embed"><iframe title="youtube" loading="lazy" src="https://www.youtube.com/embed/${esc(gs(d.videoId, "dQw4w9WgXcQ"))}" allowfullscreen></iframe>${gs(d.caption) ? `<figcaption>${esc(gs(d.caption))}</figcaption>` : ""}</figure>`;
    case "icon":
      return `<div class="rm-icon-single" style="font-size:${gn(d.size, 40)}px"><span>${esc(gs(d.glyph, "★"))}</span>${gs(d.label) ? `<em>${esc(gs(d.label))}</em>` : ""}</div>`;
    case "imageBox":
      return `<figure class="rm-image-box" style="text-align:${gs(d.align, "center")}"><img src="${esc(gs(d.src))}" alt="${esc(gs(d.title))}" loading="lazy"/><figcaption><strong>${esc(gs(d.title))}</strong><span>${esc(gs(d.body))}</span></figcaption></figure>`;
    case "iconBox":
      return `<div class="rm-icon-box"><span class="rm-ib-glyph">${esc(gs(d.glyph, "◈"))}</span><div><strong>${esc(gs(d.title))}</strong><span>${esc(gs(d.body))}</span></div></div>`;
    case "imageCarousel":
    case "mediaCarousel": {
      const images = garr<string>(d.images);
      return images.length
        ? `<div class="rm-carousel rm-carousel-static"><div class="rm-carousel-track"><img src="${esc(images[0])}" alt="" loading="lazy"/></div><button class="rm-car-btn rm-car-prev" onclick="return false" aria-label="Previous">‹</button><button class="rm-car-btn rm-car-next" onclick="return false" aria-label="Next">›</button><div class="rm-car-dots">${images.map((_, k) => `<i class="${k === 0 ? "on" : ""}"></i>`).join("")}</div></div>`
        : "";
    }
    case "gallery": {
      const images = garr<string>(d.images);
      return `<div class="rm-gallery" style="grid-template-columns:repeat(${gn(d.columns, 2)},1fr)">${images.map((src) => `<img src="${esc(src)}" alt="" loading="lazy"/>`).join("")}</div>`;
    }
    case "iconList": {
      const items = garr<string>(d.items);
      return `<ul class="rm-icon-list">${items.map((it) => `<li><span class="rm-il-glyph">${esc(gs(d.glyph, "✓"))}</span>${esc(it)}</li>`).join("")}</ul>`;
    }
    case "counter":
      return `<div class="rm-counter"><strong>${esc(gs(d.prefix))}${gn(d.end, 100).toLocaleString()}${esc(gs(d.suffix))}</strong>${gs(d.title) ? `<span>${esc(gs(d.title))}</span>` : ""}</div>`;
    case "testimonial":
      return `<figure class="rm-testimonial"><blockquote>“${esc(gs(d.quote))}”</blockquote><figcaption>${gs(d.avatar) ? `<img src="${esc(gs(d.avatar))}" alt="" loading="lazy"/>` : ""}<span><strong>${esc(gs(d.author))}</strong>${gs(d.role) ? `<em>${esc(gs(d.role))}</em>` : ""}</span></figcaption></figure>`;
    case "tabs": {
      const tabs = garr<{ title: string; body: string }>(d.tabs);
      return tabs.length
        ? `<div class="rm-tabs"><div class="rm-tab-strip">${tabs.map((t, i) => `<button class="rm-tab ${i === 0 ? "rm-tab-on" : ""}" onclick="return false">${esc(t.title)}</button>`).join("")}</div><div class="rm-tab-panel">${esc(tabs[0]?.body ?? "")}</div></div>`
        : "";
    }
    case "accordion": {
      const items = garr<{ title: string; body: string }>(d.items);
      return items.length
        ? `<div class="rm-accordion">${items.map((it, i) => `<div class="rm-acc-item ${i === 0 ? "rm-acc-open" : ""}"><button class="rm-acc-head" onclick="return false"><span>${esc(it.title)}</span><span class="rm-acc-sign">${i === 0 ? "−" : "+"}</span></button>${i === 0 ? `<div class="rm-acc-body">${esc(it.body)}</div>` : ""}</div>`).join("")}</div>`
        : "";
    }
    case "toggle":
      return `<div class="rm-accordion"><div class="rm-acc-item"><button class="rm-acc-head" onclick="return false"><span>${esc(gs(d.title, "Toggle"))}</span><span class="rm-acc-sign">+</span></button></div></div>`;
    case "socialIcons":
      return `<div class="rm-social">${garr<string>(d.networks).map((net) => `<span class="rm-social-icon" title="${esc(net)}">${NET_GLYPH_HTML[net] ?? esc(net.slice(0, 2))}</span>`).join("")}</div>`;
    case "sidebar": {
      const items = garr<string>(d.items);
      return `<aside class="rm-sidebar"><strong>${esc(gs(d.title, "Widgets"))}</strong><ul>${items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul></aside>`;
    }
    case "textPath":
      return `<div class="rm-textpath"><svg viewBox="0 0 300 80" width="100%"><defs><path id="tp-${esc(block.id)}" d="M5,55 Q75,5 150,45 T295,35" fill="none"/></defs><text><textPath href="#tp-${esc(block.id)}" startOffset="0">${esc(gs(d.text, "Text on a path"))}</textPath></text></svg></div>`;
    case "form": {
      const fields = garr<string>(d.fields);
      return `<form class="rm-form" onsubmit="return false">${gs(d.title) ? `<strong class="rm-form-title">${esc(gs(d.title))}</strong>` : ""}${fields.map((f) => (f.toLowerCase().includes("message") ? `<textarea placeholder="${esc(f)}" rows="2"></textarea>` : `<input placeholder="${esc(f)}"/>`)).join("")}<button class="rm-button rm-button-solid">${esc(gs(d.submit, "Submit"))}</button></form>`;
    }
    case "cta":
      return `<div class="rm-cta"${gs(d.src) ? ` style="background-image:url('${escUrlForCssAttr(gs(d.src))})'"` : ""}><div class="rm-cta-inner"><strong>${esc(gs(d.title))}</strong><span>${esc(gs(d.body))}</span><a class="rm-button rm-button-solid" href="#" onclick="return false">${esc(gs(d.button, "Learn more"))}</a></div></div>`;
    case "flipBox":
      return `<div class="rm-flipbox"><div class="rm-flip-inner"><div class="rm-flip-front"${gs(d.front) ? ` style="background-image:url('${escUrlForCssAttr(gs(d.front))})'"` : ""}><span>${esc(gs(d.frontTitle, "Hover"))}</span></div><div class="rm-flip-back"><strong>${esc(gs(d.backTitle))}</strong><span>${esc(gs(d.backBody))}</span></div></div></div>`;
    case "priceList": {
      const items = garr<{ name: string; desc: string; price: string }>(d.items);
      return `<ul class="rm-pricelist">${items.map((it) => `<li><span class="rm-pl-name">${esc(it.name)}</span><span class="rm-pl-dots"></span><span class="rm-pl-price">${esc(it.price)}</span>${it.desc ? `<em class="rm-pl-desc">${esc(it.desc)}</em>` : ""}</li>`).join("")}</ul>`;
    }
    case "priceTable":
      return `<div class="rm-pricetable ${gbool(d.featured) ? "rm-pt-featured" : ""}"><div class="rm-pt-head"><span class="rm-pt-plan">${esc(gs(d.plan, "Plan"))}</span><span class="rm-pt-price">${esc(gs(d.price))}<em>${esc(gs(d.period))}</em></span></div><ul>${garr<string>(d.features).map((f) => `<li>${esc(f)}</li>`).join("")}</ul><a class="rm-button rm-button-solid" href="#" onclick="return false">${esc(gs(d.button, "Choose"))}</a></div>`;
    case "shareButtons":
      return `<div class="rm-share">${garr<string>(d.networks).map((net) => `<span class="rm-share-btn" title="Share on ${esc(net)}"><i>${NET_GLYPH_HTML[net] ?? esc(net.slice(0, 2))}</i>${esc(net)}</span>`).join("")}</div>`;
    case "animatedHeadline": {
      const words = garr<string>(d.words);
      return `<h3 class="rm-animated-headline">${esc(gs(d.before))} <span class="rm-ah-word">${esc(words[0] ?? "")}</span> ${esc(gs(d.after))}</h3>`;
    }
    case "testimonialCarousel": {
      const items = garr<{ quote: string; author: string }>(d.items);
      return items.length
        ? `<div class="rm-tcar"><blockquote>“${esc(items[0].quote)}”</blockquote><cite>— ${esc(items[0].author)}</cite><div class="rm-car-dots">${items.map((_, k) => `<i class="${k === 0 ? "on" : ""}"></i>`).join("")}</div></div>`
        : "";
    }
    case "reviews": {
      const items = garr<{ stars: number; text: string; author: string }>(d.items);
      return `<div class="rm-reviews">${items.map((r) => `<div class="rm-review"><span class="rm-review-stars">${starsHtml(gn(r.stars, 5))}</span><p>${esc(r.text)}</p><cite>— ${esc(r.author)}</cite></div>`).join("")}</div>`;
    }
    case "facebook":
      return `<div class="rm-facebook"><span class="rm-fb-badge">f</span><div><strong>${esc(gs(d.page, "Facebook Page"))}</strong><span>${gs(d.mode) === "comments" ? "Comments plugin" : "Page plugin"}</span></div><button class="rm-fb-like" onclick="return false">👍 Like</button></div>`;
    case "lottie":
      return `<div class="rm-lottie"><div class="rm-lottie-orb rm-lottie-${esc(gs(d.preset, "pulse"))}"></div>${gs(d.caption) ? `<figcaption>${esc(gs(d.caption))}</figcaption>` : ""}</div>`;
    case "countdown": {
      const target = new Date(gs(d.target, new Date().toISOString()));
      const diff = Math.max(0, target.getTime() - Date.now());
      const cd = (v: number, l: string) => `<div class="rm-cd-cell"><b>${String(v).padStart(2, "0")}</b><span>${l}</span></div>`;
      return `<div class="rm-countdown">${gs(d.title) ? `<p class="rm-cd-title">${esc(gs(d.title))}</p>` : ""}<div class="rm-cd-grid">${cd(Math.floor(diff / 864e5), "days")}${cd(Math.floor((diff % 864e5) / 36e5), "hrs")}${cd(Math.floor((diff % 36e5) / 6e4), "min")}${cd(Math.floor((diff % 6e4) / 1000), "sec")}</div></div>`;
    }
    case "iframe":
      return `<figure class="rm-media rm-embed" style="height:${gn(d.height, 220)}px"><iframe title="embed" src="${esc(gs(d.url, "https://example.com"))}" loading="lazy"></iframe></figure>`;
    default:
      return "";
  }
}

function isGenericBlockType(t: string): boolean {
  const core = new Set(["heading", "text", "kicker", "rule", "quote", "image", "video", "chart", "numbers", "notes", "cover", "divider"]);
  return !core.has(t);
}

function renderBlock(block: Block): string {
  switch (block.type) {
    case "cover": {
      const d = block.data;
      return `
        <div class="rm-cover">
          <div class="rm-cover-crest" aria-hidden="true">
            <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="53"/><circle class="crest-dash" cx="60" cy="60" r="45"/><path d="M30 78 L60 28 L90 78"/><path d="M43 78 L60 50 L77 78"/><path d="M28 90 H92"/></svg>
          </div>
          ${d.edition ? `<div class="rm-cover-edition">${esc(d.edition)}</div>` : ""}
          <div class="rm-cover-body">
            <span class="rm-cover-rule"></span>
            <h1 class="rm-cover-title">${esc(d.title)}</h1>
            <span class="rm-cover-rule"></span>
            ${d.subtitle ? `<p class="rm-cover-subtitle">${esc(d.subtitle)}</p>` : ""}
          </div>
        </div>`;
    }
    case "heading": {
      const d = block.data;
      return `<h2 class="rm-heading">${esc(d.title)}${d.sub ? `<span class="rm-heading-sub">${esc(d.sub)}</span>` : ""}</h2>`;
    }
    case "kicker":
      return `<p class="rm-kicker">${esc(block.data.label)}</p>`;
    case "text":
      return `<p class="rm-text" style="font-size:${block.data.size ?? 15}px;line-height:${block.data.lineHeight ?? 1.55}">${esc(block.data.body)}</p>`;
    case "quote": {
      const d = block.data;
      return `<blockquote class="rm-quote"><span aria-hidden="true">"</span><p>${esc(d.text)}</p>${d.attribution ? `<cite>— ${esc(d.attribution)}</cite>` : ""}</blockquote>`;
    }
    case "rule":
      return `<div class="${block.data.bold ? "rm-rule rm-rule-bold" : "rm-rule"}"></div>`;
    case "divider":
      return `<div class="rm-divider"><span></span>${block.data.label ? `<em>${esc(block.data.label)}</em>` : ""}<span></span></div>`;
    case "image": {
      const d = block.data;
      const fit = d.fit ?? "cover";
      return `<figure class="rm-media rm-media-${fit}"><img src="${esc(d.src)}" alt="${esc(d.alt || d.caption || "")}" loading="lazy" />${d.caption ? `<figcaption>${esc(d.caption)}</figcaption>` : ""}</figure>`;
    }
    case "video": {
      const d = block.data;
      const fit = (d.fit as string) ?? "contain";
      return `<figure class="rm-media rm-media-${fit} rm-video"><video src="${esc(d.src)}" poster="${esc(d.cover || "")}" controls playsinline preload="metadata"></video>${d.caption ? `<figcaption>${esc(d.caption)}</figcaption>` : ""}</figure>`;
    }
    case "chart": {
      const d = block.data;
      const isBar = d.kind === "bar";
      return `
        <figure class="rm-chart">
          ${d.title ? `<figcaption class="rm-chart-title">${esc(d.title)}</figcaption>` : ""}
          <div class="rm-chart-box rm-chart-static ${isBar ? "rm-chart-bar" : "rm-chart-line"}">
            <div class="rm-chart-static-inner">
              ${isBar
                ? `<div class="static-bars"><i style="height:78%"></i><i style="height:66%"></i><i style="height:44%"></i><i style="height:58%"></i><i style="height:38%"></i><i style="height:71%"></i></div><span class="static-chart-label">Ship readiness</span>`
                : `<svg viewBox="0 0 640 170" class="static-line-svg" preserveAspectRatio="none" aria-hidden="true"><path d="M 12 120 C 90 95, 160 92, 210 82 S 330 24, 420 28 S 540 54, 628 18" fill="none" stroke="#c0432c" stroke-width="3.2" stroke-linecap="round"/><path d="M 12 138 C 90 128, 150 122, 210 108 S 330 72, 420 60 S 540 28, 628 34" fill="none" stroke="#2c6f63" stroke-width="3.2" stroke-linecap="round"/></svg><span class="static-chart-label">Activation vs repeats</span>`
              }
            </div>
          </div>
        </figure>`;
    }
    case "numbers":
      return `<div class="rm-numbers">${block.data.items.map((it) => `<div class="rm-num"><strong>${esc(it.value)}</strong><span>${esc(it.label)}</span></div>`).join("")}</div>`;
    case "notes":
      return `<aside class="rm-note">${esc(block.data.body)}</aside>`;
    default:
      return isGenericBlockType(block.type) ? renderGenericBlock(block) : "";
  }
}

// ------------------------------------------------------------------
// page face helpers (used by both static and flip book exports)
// ------------------------------------------------------------------

type PageLike = { id: string; tone: string; bgPreset?: string; customBgColor?: string; blocks: Block[]; isIndexPage?: boolean; bgImage?: string; bgImageOpacity?: number; bgImageFit?: string; bgBlendMode?: string; title: string; label: string };

function pageBgStyle(pg: PageLike): { bg: string; color: string; kicker: string; isDark: boolean } {
  if (pg.customBgColor) {
    const d = isColorDark(pg.customBgColor);
    return { bg: `radial-gradient(110% 80% at 15% 10%, rgba(255,255,255,${d ? 0.12 : 0.65}),transparent 52%),${pg.customBgColor}`, color: d ? "#f2e8d6" : "#1d1e19", kicker: d ? "#e7c98a" : "#c0432c", isDark: d };
  }
  if (pg.tone === "cover" || pg.tone === "closing") {
    return { bg: "radial-gradient(100% 70% at 18% 6%,rgba(231,201,138,0.2),transparent 58%),linear-gradient(158deg,#1f3a31 0%,#16261f 55%,#0e1a16 100%)", color: "#f6ead0", kicker: "#e7c98a", isDark: true };
  }
  const preset = PAGE_PRESETS.find((p) => p.id === pg.bgPreset) || (pg.tone === "dark" ? PAGE_PRESETS.find((p) => p.id === "dark")! : PAGE_PRESETS.find((p) => p.id === "cream")!);
  if (preset) return { bg: preset.background, color: preset.textColor, kicker: preset.kickerColor ?? (preset.dark ? "#e7c98a" : "#c0432c"), isDark: preset.dark };
  return { bg: "linear-gradient(104deg,#fdf8ec 0%,#f6efdd 52%,#ece2c9 100%)", color: "#1d1e19", kicker: "#c0432c", isDark: false };
}

/** Page face (front-side content) used in both exports */
function renderPageFace(pg: PageLike, allPages: BookPage[], extra?: { cls?: string; blockHtmlOverride?: string }): string {
  const { bg, color, kicker, isDark } = pageBgStyle(pg);
  const ordered = [...pg.blocks].sort((a, b) => a.order - b.order);
  const blocksHtml = extra?.blockHtmlOverride ?? ordered.map(renderBlock).join("\n");
  const bgImg = pg.bgImage
    ? `<div class="page-bg-image" style="background-image:url('${escUrlForCssAttr(pg.bgImage)}');opacity:${(pg.bgImageOpacity ?? 40) / 100};background-size:${pg.bgImageFit === "tile" ? "auto" : (pg.bgImageFit ?? "cover")};background-repeat:${pg.bgImageFit === "tile" ? "repeat" : "no-repeat"};background-position:center;mix-blend-mode:${esc(pg.bgBlendMode ?? (isDark ? "screen" : "multiply"))};"></div>`
    : "";
  let tocHtml = "";
  if (pg.isIndexPage && allPages.length > 1) {
    const last = allPages.length - 1;
    const rows = allPages
      .filter((_, idx) => idx > 0 && idx < last)
      .map((p, i) => `<button class="toc-row" data-goto="${allPages.indexOf(p)}"><span class="toc-n">${String(i + 1).padStart(2, "0")}</span><span class="toc-t">${esc(p.title)}</span><span class="toc-dots"></span><span class="toc-l">${esc(p.label)}</span></button>`)
      .join("");
    tocHtml = `<div style="margin-top:auto"><div class="rm-rule rm-rule-bold" style="opacity:0.4"></div><p style="margin:8px 0 6px;font-family:var(--font-mono);font-size:9px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.55">Contents</p><nav style="display:grid;gap:3px">${rows}</nav></div>`;
  }
  return `<div class="page-face-compose ${pg.tone} ${isDark ? "dark-theme" : "light-theme"} ${pg.bgPreset ? `preset-${pg.bgPreset}` : ""}" style="background:${bg};color:${color};--kicker-color:${kicker}">
    ${bgImg}
    <div class="face-grain" aria-hidden="true"></div>
    <div class="page-blocks">${blocksHtml}${tocHtml}</div>
  </div>`;
}

/** Verso (back face) — simple mirrored title */
function renderVerso(pg: PageLike): string {
  const isDark = pg.tone === "dark" || pg.tone === "cover" || pg.tone === "closing" || pg.bgPreset === "dark" || pg.bgPreset === "midnight" || isColorDark(pg.customBgColor);
  return `<div class="verso ${isDark ? "tone-dark" : ""}"><div class="face-grain"></div><div class="show-through font-serif">${esc(pg.title)}</div><div class="verso-folio font-mono">verso · ${esc(pg.label)}</div></div>`;
}

// ==================================================================
// STATIC EXPORT (scrollable pages — existing behavior)
// ==================================================================

function renderStaticPage(pg: PageLike, idx: number, total: number, tocEntries: { page: PageLike; idx: number }[]): string {
  const { bg, color, kicker, isDark } = pageBgStyle(pg);
  const ordered = [...pg.blocks].sort((a, b) => a.order - b.order);
  const blocksHtml = ordered.map(renderBlock).join("\n");
  const bgImg = pg.bgImage
    ? `<div class="export-bg-image" style="background-image:url(&quot;${escUrlForCssAttr(pg.bgImage)}&quot;);opacity:${(pg.bgImageOpacity ?? 40) / 100};background-size:${pg.bgImageFit === "tile" ? "auto" : (pg.bgImageFit ?? "cover")};background-repeat:${pg.bgImageFit === "tile" ? "repeat" : "no-repeat"};mix-blend-mode:${esc(pg.bgBlendMode ?? (isDark ? "screen" : "multiply"))};"></div>`
    : "";
  let indexHtml = "";
  if (pg.isIndexPage) {
    const rows = tocEntries.map(({ page: p, idx: oi }, i) => `<a class="export-toc-row" href="#page-${slugify(p.title)}-${oi}"><span class="export-toc-num">${String(i + 1).padStart(2, "0")}</span><span class="export-toc-title">${esc(p.title)}</span><span class="export-toc-dots"></span><span class="export-toc-label">${esc(p.label)}</span></a>`).join("\n");
    indexHtml = `\n      <div class="export-toc"><div class="rm-rule rm-rule-bold" style="opacity:0.45;margin:0.65rem 0 0.9rem"></div><p class="export-toc-kicker">Contents</p><nav class="export-toc-list">${rows}</nav></div>`;
  }
  const anchor = `page-${slugify(pg.title)}-${idx}`;
  const folio = idx === 0 ? "Front cover" : idx === total - 1 ? "Back cover" : `Page ${String(idx + 1).padStart(2, "0")} · ${esc(pg.label)}`;
  return `<section id="${anchor}" class="export-page ${isDark ? "export-dark" : "export-light"} tone-${pg.tone} ${pg.bgPreset ? `preset-${pg.bgPreset}` : ""}" style="background:${bg};color:${color};--kicker:${kicker}">
    ${bgImg}
    <div class="export-grain" aria-hidden="true"></div>
    <div class="export-page-head"><span class="export-folio">${esc(folio)}</span>${pg.tone === "cover" || pg.tone === "closing" ? `<span class="export-edition">${esc(pg.tone === "cover" ? "Edition" : "Closing")}</span>` : ""}</div>
    <div class="export-page-body">${blocksHtml}${indexHtml}</div>
    <div class="export-page-foot"><span class="export-page-num">${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span><span class="export-page-label">${esc(pg.label)}</span></div>
  </section>`;
}

export function buildExportHtml(session: Session): string {
  const total = session.pages.length;
  const tocEntries = session.pages.slice(1, Math.max(1, total - 1)).map((p, i) => ({ page: p as PageLike, idx: i + 1 }));
  const pagesHtml = session.pages.map((p, i) => renderStaticPage(p as PageLike, i, total, tocEntries)).join("\n");
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `<!doctype html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${esc(session.title)} — ${esc(session.edition)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
:root{--font-display:"Bricolage Grotesque",system-ui,sans-serif;--font-serif:"Newsreader",Georgia,serif;--font-mono:"IBM Plex Mono",ui-monospace,monospace;--color-marker:#c0432c;--color-foil:#e7c98a;--color-pine:#2c6f63;--paper:#f7f1e3}
*{box-sizing:border-box}html,body{margin:0;min-height:100%}
body{font-family:var(--font-serif);color:#1d1e19;background:radial-gradient(120% 82% at 14% -6%,rgba(231,201,138,0.22),transparent 46%),radial-gradient(80% 60% at 86% 104%,rgba(44,111,99,0.28),transparent 60%),linear-gradient(158deg,#16261f 0%,#101c18 42%,#0b1411 100%);-webkit-font-smoothing:antialiased}
a{color:inherit}
.export-shell{max-width:880px;margin:0 auto;padding:clamp(18px,3vw,32px) clamp(14px,3vw,28px) 48px}
.export-top{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:18px 0 16px;border-bottom:1px solid rgba(231,201,138,0.18);margin-bottom:clamp(18px,3vw,28px)}
.export-brand{display:flex;align-items:center;gap:12px}
.export-mark{display:grid;place-items:center;width:38px;height:38px;border-radius:3px 11px 11px 3px;background:linear-gradient(150deg,#f4e0af,#d8b26c 60%,#b98c43);color:#17251f;font-weight:800;box-shadow:0 8px 20px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.6);font-family:var(--font-display);font-size:15px}
.export-kicker{font-family:var(--font-mono);font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(231,201,138,0.65)}
.export-title{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,4vw,32px);letter-spacing:-0.04em;line-height:0.95;color:#f6efdf;margin-top:4px}
.export-title i{color:var(--color-marker);font-style:normal}
.export-meta{display:flex;gap:16px;align-items:flex-end}
.export-meta-cell{border-left:1px solid rgba(231,201,138,0.18);padding-left:10px;min-width:78px}
.export-meta-k{font-family:var(--font-mono);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.55;color:#efe6d5}
.export-meta-v{font-family:var(--font-mono);font-size:13px;font-weight:600;color:#f2e7d0}
.export-book{display:flex;flex-direction:column;gap:clamp(16px,3vw,24px)}
.export-page{position:relative;overflow:hidden;border-radius:10px;box-shadow:0 22px 50px rgba(0,0,0,0.45),inset 0 0 0 1px rgba(120,100,70,0.18),inset 0 0 44px rgba(120,96,58,0.10);padding:0;min-height:520px;isolation:isolate}
.export-bg-image{position:absolute;inset:0;z-index:0;pointer-events:none;background-position:center;background-size:cover}
.export-grain{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0.42;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23p)' opacity='0.42'/%3E%3C/svg%3E")}
.export-dark .export-grain{mix-blend-mode:overlay;opacity:0.22}
.export-page-head,.export-page-foot,.export-page-body{position:relative;z-index:2}
.export-page-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 18px 9px;border-bottom:1px solid rgba(120,100,70,0.14);font-family:var(--font-mono);font-size:9px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.62}
.export-dark .export-page-head{border-bottom-color:rgba(231,201,138,0.14)}
.export-edition{opacity:0.9}
.export-page-body{padding:28px 26px 28px;display:flex;flex-direction:column;gap:14px}
.export-page-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 18px 12px;border-top:1px solid rgba(120,100,70,0.12);font-family:var(--font-mono);font-size:9px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.55}
.export-dark .export-page-foot{border-top-color:rgba(231,201,138,0.12)}
.rm-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,4.5vw,42px);line-height:0.92;letter-spacing:-0.045em;white-space:pre-line;margin:0}
.rm-heading-sub{display:block;margin-top:8px;font-family:var(--font-serif);font-weight:400;font-style:italic;font-size:0.58em;letter-spacing:0;opacity:0.72}
.rm-kicker{font-family:var(--font-mono);font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:var(--kicker);margin:0}
.rm-text{font-family:var(--font-serif);opacity:0.88;white-space:pre-line;margin:0}
.rm-quote{position:relative;padding:6px 0 6px 18px;border-left:2px solid rgba(192,67,44,0.55);margin:0}
.rm-quote>span{position:absolute;left:3px;top:-4px;font-size:28px;line-height:1;color:rgba(192,67,44,0.5)}
.rm-quote p{font-size:clamp(16px,2.6vw,22px);font-style:italic;line-height:1.28;letter-spacing:-0.02em;margin:0}
.rm-quote cite{display:block;margin-top:6px;font-family:var(--font-mono);font-style:normal;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.6}
.rm-rule{height:1px;background:linear-gradient(90deg,rgba(192,67,44,0.85),rgba(120,100,70,0.3) 62%,transparent)}
.rm-rule-bold{height:2px;background:linear-gradient(90deg,transparent,#e7c98a 12%,#fff3d2 38%,#b78f4c 62%,#e7c98a 82%,transparent)}
.rm-divider{display:flex;align-items:center;gap:10px;opacity:0.62}
.rm-divider span{flex:1;height:1px;background:currentColor;opacity:0.28}
.rm-divider em{font-family:var(--font-mono);font-style:normal;font-size:9px;letter-spacing:0.24em;text-transform:uppercase;white-space:nowrap}
.rm-note{padding:8px 10px;border-left:2px solid rgba(192,67,44,0.6);background:rgba(192,67,44,0.07);font-family:var(--font-mono);font-size:11px;line-height:1.55;letter-spacing:0.02em;text-transform:uppercase;opacity:0.86}
.export-dark .rm-note{border-left-color:rgba(231,201,138,0.6);background:rgba(231,201,138,0.08)}
.rm-media{width:100%;margin:0}
.rm-media img,.rm-media video{display:block;width:100%;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(120,100,70,0.24),0 10px 24px rgba(60,40,16,0.18)}
.rm-media-cover img,.rm-media-cover video{height:280px;object-fit:cover}
.rm-media-contain img,.rm-media-contain video{height:280px;object-fit:contain;background:rgba(0,0,0,0.04)}
.rm-media-natural img,.rm-media-natural video{height:auto;object-fit:contain}
.rm-media figcaption{margin-top:6px;font-family:var(--font-mono);font-size:9px;letter-spacing:0.1em;text-transform:uppercase;opacity:0.6;text-align:center}
.rm-numbers{display:grid;grid-template-columns:repeat(auto-fit,minmax(78px,1fr));gap:14px;padding:12px 0;border-top:1px solid rgba(120,100,70,0.22);border-bottom:1px solid rgba(120,100,70,0.22)}
.export-dark .rm-numbers{border-color:rgba(231,201,138,0.18)}
.rm-num{display:flex;flex-direction:column;gap:4px;text-align:center}
.rm-num strong{font-family:var(--font-display);font-weight:800;font-size:30px;letter-spacing:-0.04em;color:var(--color-marker);line-height:1}
.export-dark .rm-num strong{color:#ffb49f}
.rm-num span{font-family:var(--font-mono);font-size:9px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.62}
.rm-chart{width:100%;margin:0}
.rm-chart-title{font-family:var(--font-mono);font-size:9px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.6;margin:0 0 6px}
.rm-chart-box{position:relative;height:190px;padding:10px;border-radius:7px;background:rgba(255,255,255,0.42);box-shadow:inset 0 0 0 1px rgba(120,100,70,0.16)}
.export-dark .rm-chart-box{background:rgba(255,255,255,0.06);box-shadow:inset 0 0 0 1px rgba(231,201,138,0.16)}
.rm-chart-static{display:grid;place-items:center}
.rm-chart-static-inner{width:100%;height:100%;display:grid;place-items:center;gap:8px}
.static-bars{display:flex;align-items:flex-end;gap:5px;height:92px;width:100%;justify-content:center}
.static-bars i{display:block;flex:1;max-width:42px;border-radius:3px 3px 0 0;background:linear-gradient(180deg,#2c6f63,#55a08c)}
.static-bars i:nth-child(3),.static-bars i:nth-child(5){background:linear-gradient(180deg,#d99b2b,#f0c56a)}
.static-bars i:nth-child(5){background:linear-gradient(180deg,#c0432c,#e07a6a)}
.static-line-svg{width:100%;height:96px;display:block}
.static-chart-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.55;text-align:center}
.rm-cover{position:relative;min-height:340px;display:flex;flex-direction:column;justify-content:flex-end;color:#f0dcae;padding:6px 0 4px}
.rm-cover-crest{position:absolute;top:0;right:0;width:132px;height:132px;opacity:0.95}
.rm-cover-crest svg{width:100%;height:100%;fill:none;stroke:rgba(231,201,138,0.36);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.crest-dash{stroke-width:1.5;stroke-dasharray:3 7}
.rm-cover-edition{position:absolute;top:0;right:0;font-family:var(--font-mono);font-size:9px;letter-spacing:0.26em;text-transform:uppercase;color:#f0dcae;opacity:0.86}
.rm-cover-rule{height:2px;background:linear-gradient(90deg,transparent,#e7c98a 12%,#fff3d2 38%,#b78f4c 62%,#e7c98a 82%,transparent);box-shadow:0 1px 0 rgba(0,0,0,0.45)}
.rm-cover-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,7vw,58px);line-height:0.88;letter-spacing:-0.045em;text-transform:uppercase;white-space:pre-line;margin:18px 0;color:#f0d9a4;text-shadow:0 1px 0 rgba(0,0,0,0.5)}
.rm-cover-subtitle{font-family:var(--font-serif);font-style:italic;font-size:15px;line-height:1.5;color:rgba(239,224,194,0.86);max-width:86%;margin:14px 0 0}
.export-toc{margin-top:6px}.export-toc-kicker{font-family:var(--font-mono);font-size:9px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.55;margin:0 0 8px}.export-toc-list{display:grid;gap:4px}
.export-toc-row{display:flex;align-items:baseline;gap:8px;width:100%;padding:7px 8px;border-radius:7px;text-decoration:none;color:inherit;transition:background 0.2s,transform 0.2s,color 0.2s}
.export-toc-row:hover{background:rgba(231,201,138,0.12);transform:translateX(2px);color:var(--color-foil)}
.export-light .export-toc-row:hover{color:var(--color-marker);background:rgba(192,67,44,0.08)}
.export-toc-num{font-family:var(--font-mono);font-size:10px;opacity:0.55}.export-toc-title{font-family:var(--font-display);font-weight:600;font-size:14px;letter-spacing:-0.02em}
.export-toc-dots{flex:1;border-bottom:1px dotted rgba(120,100,70,0.32);transform:translateY(-3px);opacity:0.7}.export-dark .export-toc-dots{border-bottom-color:rgba(231,201,138,0.28)}
.export-toc-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.6;white-space:nowrap}
.export-footer{margin-top:22px;border-top:1px solid rgba(231,201,138,0.14);padding-top:14px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;color:rgba(239,230,213,0.62);font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase}
.export-footer a{color:var(--color-foil);text-decoration:none;border-bottom:1px dashed rgba(231,201,138,0.4)}
@media print{body{background:#f7f1e3}.export-shell{padding:0;max-width:100%}.export-page{break-inside:avoid;box-shadow:none;border:1px solid rgba(120,100,70,0.22);min-height:auto}}
@media(max-width:640px){.export-top{flex-direction:column;align-items:flex-start}.export-page-body{padding:18px 16px 20px}.rm-media-cover img,.rm-media-cover video{height:210px}}
</style></head><body>
<div class="export-shell">
  <header class="export-top"><div class="export-brand"><span class="export-mark">▭</span><div><div class="export-kicker">Exported playbook · ${esc(session.edition)} · ${esc(now)}</div><div class="export-title">${esc(session.title)}<i>.</i></div></div></div><div class="export-meta"><div class="export-meta-cell"><div class="export-meta-k">Pages</div><div class="export-meta-v">${total}</div></div><div class="export-meta-cell"><div class="export-meta-k">Blocks</div><div class="export-meta-v">${session.pages.reduce((a, p) => a + p.blocks.length, 0)}</div></div></div></header>
  <main class="export-book">${pagesHtml}</main>
  <footer class="export-footer"><span>Final edited version — ${esc(session.title)} · ${total} pages · exported ${esc(now)}</span><span>Designed for print — use <b>File → Print → Save as PDF</b></span></footer>
</div></body></html>`;
}

// ==================================================================
// FLIP BOOK EXPORT (3D interactive flip book)
// ==================================================================

export function buildFlipBookHtml(session: Session): string {
  const ALL = session.pages as PageLike[];
  const isVertical = session.flipAxis === "vertical";
  const speedKey = session.flipSpeed ?? DEFAULT_FLIP_SPEED;
  const DURATION = FLIP_SPEEDS[speedKey as FlipSpeed]?.ms ?? FLIP_SPEEDS[DEFAULT_FLIP_SPEED].ms;

  // Build pages array for JS — include title/label so the exported chrome can show them
  const pagesJs = ALL.map((pg) => {
    const front = renderPageFace(pg, ALL as unknown as BookPage[]);
    const verso = renderVerso(pg);
    return JSON.stringify({ front, verso, tone: pg.tone, label: pg.label, title: pg.title, isBoard: pg.tone === "cover" || pg.tone === "closing" });
  });

  // Book styles — ported from the app's index.css (structure + flip mechanics + blocks)
  const CSS = `
*{box-sizing:border-box}
html{height:100%;scrollbar-width:thin;scrollbar-color:rgba(231,201,138,0.25) transparent}
html,body{margin:0;width:100%;min-height:100vh;min-height:100dvh;min-height:100svh}
body{font-family:var(--font-serif);color:#1d1e19;background:radial-gradient(120% 82% at 14% -6%,rgba(231,201,138,0.22),transparent 46%),radial-gradient(80% 60% at 86% 104%,rgba(44,111,99,0.28),transparent 60%),linear-gradient(158deg,#16261f 0%,#101c18 42%,#0b1411 100%);-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch}
:root{--font-display:"Bricolage Grotesque",system-ui,sans-serif;--font-serif:"Newsreader",Georgia,serif;--font-mono:"IBM Plex Mono",ui-monospace,monospace;--color-marker:#c0432c;--color-foil:#e7c98a;--color-pine:#2c6f63;--paper:#f7f1e3;--bw:clamp(250px,min(34vw,50vh,88vw),520px);--bh:calc(var(--bw)*1.42);--edge-size:6px}

/* present bar */
:fullscreen .shell,:-webkit-full-screen .shell{max-width:none;width:100vw;height:100vh;height:100dvh;height:100svh;min-height:100vh;min-height:100dvh;min-height:100svh}
:fullscreen .grid,:-webkit-full-screen .grid{height:100%}
:fullscreen .stage,:-webkit-full-screen .stage{height:100%}
50%{opacity:0.25}}
/* mode bar */
.mode-toggle:hover{color:#f8f1e0;background:rgba(231,201,138,0.12)}
/* shell */
.shell{position:relative;display:grid;grid-template-rows:auto 1fr auto;min-height:100vh;min-height:100dvh;min-height:100svh;width:100%;max-width:none;margin:0;padding:clamp(0.7rem,2vw,1.4rem) clamp(0.7rem,2.6vw,2rem) clamp(0.5rem,1.2vw,1rem);padding-top:max(clamp(0.7rem,2vw,1.4rem),env(safe-area-inset-top));padding-right:max(clamp(0.7rem,2.6vw,2rem),env(safe-area-inset-right));padding-bottom:max(clamp(0.5rem,1.2vw,1rem),env(safe-area-inset-bottom));padding-left:max(clamp(0.7rem,2.6vw,2rem),env(safe-area-inset-left))}

/* header */
.top-bar{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem 1.5rem;flex-wrap:wrap;border-bottom:1px solid rgba(231,201,138,0.16);padding-bottom:clamp(0.4rem,1vw,0.8rem);transition:opacity 0.3s,max-height 0.4s,margin 0.3s,padding 0.3s}
.brand{display:flex;align-items:center;gap:0.85rem}
.brand-mark{display:grid;place-items:center;width:36px;height:36px;border-radius:3px 12px 12px 3px;color:#17251f;background:linear-gradient(150deg,#f4e0af,#d8b26c 60%,#b98c43);box-shadow:0 8px 20px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.6);font-family:var(--font-display);font-size:14px}
.brand-kicker{font-size:0.52rem;letter-spacing:0.26em;text-transform:uppercase;color:rgba(231,201,138,0.6)}
.brand-title{margin-top:2px;font-size:clamp(1.3rem,3vw,2.2rem);font-weight:800;letter-spacing:-0.045em;line-height:0.9;color:#f6efdf}
.top-meta{display:flex;align-items:stretch;gap:clamp(0.5rem,1.2vw,1.2rem)}
.meta-cell{display:flex;flex-direction:column;gap:2px;min-width:68px;border-left:1px solid rgba(231,201,138,0.16);padding-left:0.6rem}
.meta-key{font-family:var(--font-mono);font-size:8px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.5}
.meta-val{font-family:var(--font-mono);font-size:0.85rem;font-weight:600;color:#f2e7d0}
.meta-val i{font-style:normal;opacity:0.4;font-size:0.7em}
.progress-track{position:relative;width:110px;height:3px;border-radius:999px;background:rgba(240,230,210,0.14);overflow:hidden;margin-top:2px}
.progress-fill{position:absolute;inset:0;transform-origin:left center;background:linear-gradient(90deg,var(--color-pine),var(--color-foil));transition:transform 0.5s cubic-bezier(0.22,0.72,0.16,1)}
.meta-live{color:var(--color-foil)!important}

/* dock */
.dock{display:flex;align-items:center;justify-content:space-between;gap:0.7rem 1rem;flex-wrap:wrap;border-top:1px solid rgba(231,201,138,0.16);padding-top:clamp(0.4rem,1vw,0.8rem);transition:opacity 0.3s,max-height 0.4s,margin 0.3s,padding 0.3s}
.dock-group{display:flex;align-items:center;gap:0.35rem}
.ctl{display:inline-flex;align-items:center;justify-content:center;gap:0.4rem;min-width:34px;height:34px;padding-inline:0.5rem;border:1px solid rgba(231,201,138,0.26);border-radius:4px;color:#f2e7d0;background:rgba(255,255,255,0.045);font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.16em;text-transform:uppercase;cursor:pointer;transition:transform 0.25s,background 0.25s,border-color 0.25s,opacity 0.25s}
.ctl:hover:not(:disabled){transform:translateY(-2px);background:rgba(231,201,138,0.16);border-color:rgba(231,201,138,0.6)}
.ctl:active:not(:disabled){transform:translateY(0) scale(0.97)}
.ctl:disabled{opacity:0.28;cursor:not-allowed}
.ctl-on{background:var(--color-foil);border-color:var(--color-foil);color:#16261f}
.dock-read{display:flex;align-items:baseline;gap:0.6rem;font-family:var(--font-serif);font-size:0.78rem;color:rgba(240,230,210,0.7)}
.dock-num{font-family:var(--font-display);font-size:0.58rem;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--color-foil)}
.dock-title{font-family:var(--font-display);font-size:clamp(0.85rem,1.8vw,1.05rem);font-weight:600;letter-spacing:-0.02em;color:#f8f2e3}
.dock-hint{font-family:var(--font-mono);font-size:0.52rem;letter-spacing:0.16em;text-transform:uppercase;opacity:0.4}
.kbd{display:inline-grid;place-items:center;min-width:18px;height:16px;padding-inline:3px;border:1px solid rgba(231,201,138,0.3);border-bottom-width:2px;border-radius:3px;background:rgba(255,255,255,0.05);font-family:var(--font-mono);font-size:8px;letter-spacing:0.08em;color:rgba(246,239,223,0.8)}

/* grid (stage) */
.grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2.9fr);align-items:center;gap:clamp(0.8rem,2vw,2rem);min-width:0;min-height:0;height:100%;--tilt-x:0deg;--tilt-y:0deg}
.stage{position:relative;display:grid;place-items:center;align-content:center;min-width:0;min-height:0;height:100%;perspective:2400px;perspective-origin:50% 46%;padding:clamp(0.3rem,1vw,0.9rem) 0}
.table-shadow{position:absolute;left:50%;bottom:4%;width:min(74%,480px);height:12%;translate:-50% 0;border-radius:50%;background:radial-gradient(ellipse at center,rgba(0,0,0,0.68),rgba(0,0,0,0.2) 55%,transparent 74%);filter:blur(14px)}
.book-hang{animation:bookFloat 9s ease-in-out infinite;transform-style:preserve-3d}
@keyframes bookFloat{0%,100%{transform:translateY(-4px)}50%{transform:translateY(5px)}}

/* rails */
.rail{display:flex;flex-direction:column;gap:1.1rem;height:100%;justify-content:center}
.rail-left{align-items:flex-start}
.vertical-label{writing-mode:vertical-rl;font-size:0.54rem;letter-spacing:0.34em;text-transform:uppercase;color:rgba(240,230,210,0.45)}
.rail-note{max-width:15ch;font-size:0.76rem;line-height:1.5;color:rgba(240,230,210,0.62)}
.rail-head{font-size:0.52rem;letter-spacing:0.26em;text-transform:uppercase;color:rgba(240,230,210,0.5);font-family:var(--font-mono)}
.tick:hover{color:#f8f1e0;background:rgba(231,201,138,0.1);transform:translateX(-3px)}
.tick-past .stack-gauge{display:flex;gap:0.9rem}
.gauge-col{display:grid;gap:0.3rem;justify-items:start}
.gauge-cap{font-family:var(--font-mono);font-size:0.5rem;letter-spacing:0.2em;text-transform:uppercase;opacity:0.5}
.gauge-stack{display:flex;flex-direction:column-reverse;gap:2px;min-height:34px}
.gauge-stack i{display:block;width:26px;height:2.5px;border-radius:2px;background:linear-gradient(90deg,#f4ead6,#bfae8c)}
.rail-block{display:flex;align-items:center;gap:0.55rem}
.rail-tiny{font-family:var(--font-mono);font-size:0.6rem;opacity:0.6;font-variant-numeric:tabular-nums}

/* book */
.book{--p:0;--dur:1900ms;position:relative;width:var(--bw);height:var(--bh);transform-style:preserve-3d;transform:rotateX(var(--tilt-x)) rotateY(var(--tilt-y));transition:transform 0.55s cubic-bezier(0.2,0.72,0.18,1);cursor:grab;touch-action:pan-y;user-select:none}
.book.axis-vertical{touch-action:pan-x}
.book.is-dragging{cursor:grabbing;transition:none}
.book.is-flipping{cursor:grabbing}
.case{position:absolute;inset:-7px -9px -10px -6px;z-index:0;transform:translateZ(-19px);border-radius:4px 12px 12px 5px;background:linear-gradient(152deg,#33241a,#1c130e 62%,#120c08);box-shadow:inset 0 1px 0 rgba(255,226,176,0.22),0 30px 60px rgba(0,0,0,0.55)}
.edges{position:absolute;z-index:1;transform:translateZ(-8px);background:repeating-linear-gradient(90deg,#f6efdd 0 1.4px,#c8b998 1.4px 2.3px),linear-gradient(#f2e9d4,#bfae8c);box-shadow:inset 0 0 12px rgba(60,40,20,0.35);transition:width 0.55s cubic-bezier(0.2,0.72,0.18,1),height 0.55s cubic-bezier(0.2,0.72,0.18,1)}
.axis-horizontal .edges{top:0.9%;bottom:-0.9%;width:var(--edge-size)}
.axis-horizontal .edges-right{right:-5px;border-radius:0 5px 6px 0;transform:translateZ(-8px) skewY(0.5deg)}
.axis-horizontal .edges-left{left:-4px;border-radius:5px 0 0 6px;transform:translateZ(-8px) skewY(-0.5deg)}
.axis-vertical .edges{left:0.9%;right:-0.9%;height:var(--edge-size);background:repeating-linear-gradient(0deg,#f6efdd 0 1.4px,#c8b998 1.4px 2.3px),linear-gradient(90deg,#f2e9d4,#bfae8c)}
.axis-vertical .edges-right{bottom:-5px;border-radius:0 0 6px 6px;transform:translateZ(-8px) skewX(0.5deg)}
.axis-vertical .edges-left{top:-4px;border-radius:6px 6px 0 0;transform:translateZ(-8px) skewX(-0.5deg)}
.spine-tape{position:absolute;z-index:2}
.axis-horizontal .spine-tape{left:-6px;top:2%;bottom:2%;width:10px;border-radius:6px 0 0 6px;background:linear-gradient(90deg,rgba(0,0,0,0.5),rgba(255,220,160,0.12))}
.axis-vertical .spine-tape{top:-6px;left:2%;right:2%;height:10px;border-radius:6px 6px 0 0;background:linear-gradient(180deg,rgba(0,0,0,0.5),rgba(255,220,160,0.12))}
.static-page,.sheet{position:absolute;inset:0;transform-style:preserve-3d;border-radius:3px 11px 11px 3px}
.static-page{z-index:3;overflow:hidden;transition:filter 0.5s ease}
.book.is-flipping .static-page{filter:brightness(0.955)}
.static-page.is-board{box-shadow:0 22px 44px rgba(0,0,0,0.5)}
.gutter-shadow{position:absolute;inset:0;z-index:4;pointer-events:none;background:linear-gradient(90deg,rgba(24,16,8,0.34),rgba(24,16,8,0.06) 9%,transparent 20%)}
.axis-vertical .gutter-shadow{background:linear-gradient(180deg,rgba(24,16,8,0.34),rgba(24,16,8,0.06) 9%,transparent 20%)}
.flight-shade{position:absolute;inset:0;z-index:5;pointer-events:none;opacity:calc(var(--p)*0.9);transform:translateX(calc(var(--p)*-16%));background:linear-gradient(90deg,rgba(18,12,6,0.62),rgba(18,12,6,0.2) 34%,transparent 68%);filter:blur(6px);transition:opacity 0.4s ease}
.book[data-dir="back"] .flight-shade{transform:translateX(calc((1-var(--p))*8%)) scaleX(-1);opacity:calc((1-var(--p))*0.75)}
.axis-vertical .flight-shade{transform:translateY(calc(var(--p)*-16%));background:linear-gradient(180deg,rgba(18,12,6,0.62),rgba(18,12,6,0.2) 34%,transparent 68%)}
.axis-vertical.book[data-dir="back"] .flight-shade{transform:translateY(calc((1-var(--p))*8%)) scaleY(-1)}
.sheet{z-index:9;transform-origin:left center;will-change:transform;box-shadow:0 18px 34px rgba(0,0,0,calc(0.12+var(--p)*0.34))}
.axis-vertical .sheet{transform-origin:center top}
.sheet.snap{transition:transform var(--dur) cubic-bezier(0.36,0.02,0.22,1),opacity calc(var(--dur)*0.24) linear;transition-delay:0s,calc(var(--dur)*0.7)}
.sheet.live{transition:none}
.book[data-dir="fwd"] .sheet{opacity:calc(1-(var(--p)-0.88)*9)}
.book[data-dir="back"] .sheet{opacity:calc(0.3+var(--p)*6)}
.sheet-cover{box-shadow:0 26px 54px rgba(0,0,0,0.62)}
.sheet-cover::before{content:"";position:absolute;top:1px;bottom:1px;right:-3.5px;width:5px;border-radius:2px;background:linear-gradient(90deg,#43301f,#150d07);transform:translateZ(-1px)}
.axis-vertical .sheet-cover::before{top:auto;left:1px;right:1px;bottom:-3.5px;width:auto;height:5px;background:linear-gradient(180deg,#43301f,#150d07)}
.sheet-face{position:absolute;inset:0;overflow:hidden;border-radius:calc(3px+var(--p)*7px) calc(11px+var(--p)*26px) calc(11px+var(--p)*26px) calc(3px+var(--p)*7px);backface-visibility:hidden;transform-style:preserve-3d}
.face-back{border-radius:calc(11px+var(--p)*26px) calc(3px+var(--p)*7px) calc(3px+var(--p)*7px) calc(11px+var(--p)*26px)}
.face-front{z-index:2;transform:translateZ(1.1px)}
.face-back{transform:rotateY(180deg) translateZ(1.1px)}
.axis-vertical .face-back{transform:rotateX(180deg) translateZ(1.1px)}
.face-inner{position:absolute;inset:0;filter:brightness(calc(1-var(--p)*0.16)) saturate(calc(1-var(--p)*0.2))}
.face-back .face-inner{filter:brightness(calc(0.86+var(--p)*0.2)) saturate(0.8)}
.curl-highlight{position:absolute;inset:0;pointer-events:none;mix-blend-mode:soft-light;opacity:calc(0.2+var(--p)*0.85);background:linear-gradient(102deg,transparent 26%,rgba(255,255,255,0.95) 47%,transparent 66%);background-size:280% 100%;background-position:calc(var(--p)*175%-40%) 0}
.curl-shade{position:absolute;inset:0;pointer-events:none;opacity:calc(0.12+var(--p)*0.62);background:linear-gradient(255deg,rgba(12,8,4,0.55),transparent 34%),linear-gradient(90deg,rgba(12,8,4,0.3),transparent 26%)}
.curl-highlight-back{background-position:calc(var(--p)*-175%+140%) 0;mix-blend-mode:overlay}
.curl-shade-back{background:linear-gradient(105deg,rgba(12,8,4,0.5),transparent 40%)}
.axis-vertical .sheet-face{border-radius:calc(3px+var(--p)*7px) calc(3px+var(--p)*7px) calc(11px+var(--p)*26px) calc(11px+var(--p)*26px)}
.axis-vertical .face-back{border-radius:calc(11px+var(--p)*26px) calc(11px+var(--p)*26px) calc(3px+var(--p)*7px) calc(3px+var(--p)*7px)}
.axis-vertical .curl-highlight{background:linear-gradient(192deg,transparent 26%,rgba(255,255,255,0.95) 47%,transparent 66%);background-size:100% 280%;background-position:0 calc(var(--p)*175%-40%)}
.axis-vertical .curl-shade{background:linear-gradient(345deg,rgba(12,8,4,0.55),transparent 34%),linear-gradient(180deg,rgba(12,8,4,0.3),transparent 26%)}
.axis-vertical .curl-highlight-back{background-position:0 calc(var(--p)*-175%+140%)}
.axis-vertical .curl-shade-back{background:linear-gradient(195deg,rgba(12,8,4,0.5),transparent 40%)}
.ribbon{position:absolute;right:-13px;z-index:10;width:11px;height:46px;transform:translateZ(3px);background:linear-gradient(180deg,#d8503a,#8e2a1b);clip-path:polygon(0 0,100% 0,100% 100%,50% 76%,0 100%);box-shadow:0 6px 12px rgba(0,0,0,0.4);transition:top 0.6s cubic-bezier(0.2,0.72,0.16,1)}
.hint{position:absolute;bottom:-6px;left:50%;translate:-50% 0;display:flex;align-items:center;gap:0.5rem;font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.22em;text-transform:uppercase;color:rgba(240,230,210,0.6);animation:hintP 2.6s ease-in-out infinite}
@keyframes hintP{0%,100%{opacity:0.45}50%{opacity:1}}

/* page faces (inside the book) */
.page-face-compose{position:absolute;inset:0;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(120,100,70,0.18),inset 0 0 44px rgba(120,96,58,0.14)}
.face-blank{position:absolute;inset:0;background:linear-gradient(104deg,#f8f2e2,#ece2c9)}
.page-face-compose.paper,.page-face-compose.cover,.page-face-compose.closing{color:#1d1e19}
.page-face-compose.paper{background:radial-gradient(120% 80% at 8% 12%,rgba(255,255,255,0.7),transparent 52%),linear-gradient(104deg,#fdf8ec 0%,#f6efdd 52%,#ece2c9 100%)}
.page-face-compose.dark{color:#f2e8d6;background:radial-gradient(120% 90% at 90% 4%,rgba(231,201,138,0.22),transparent 54%),linear-gradient(104deg,#172822 0%,#12201c 62%,#0c1714 100%)}
.page-face-compose.cover{background:radial-gradient(100% 70% at 18% 6%,rgba(231,201,138,0.2),transparent 58%),linear-gradient(158deg,#1f3a31 0%,#16261f 55%,#0e1a16 100%);box-shadow:inset 0 0 0 1px rgba(231,201,138,0.18),inset 0 0 60px rgba(0,0,0,0.5)}
.page-face-compose.closing{background:radial-gradient(100% 70% at 18% 6%,rgba(231,201,138,0.18),transparent 58%),linear-gradient(158deg,#1f3a31 0%,#16261f 55%,#0e1a16 100%);box-shadow:inset 0 0 0 1px rgba(231,201,138,0.18),inset 0 0 60px rgba(0,0,0,0.5)}
.page-blocks{position:relative;z-index:10;height:100%;width:100%;display:flex;flex-direction:column;gap:clamp(0.35rem,1.3vh,0.9rem);padding:7.4% 7.2% 7%;overflow:hidden;scrollbar-width:none;contain:layout style}
.page-blocks>*{flex:none}
.face-grain{position:absolute;inset:0;pointer-events:none;opacity:0.5;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23p)' opacity='0.42'/%3E%3C/svg%3E")}
.page-face-compose.dark .face-grain,.page-face-compose.dark-theme .face-grain{mix-blend-mode:overlay;opacity:0.28}
.page-bg-image{position:absolute;inset:0;z-index:1;pointer-events:none;background-position:center;transition:opacity 0.3s ease}
.verso{position:relative;height:100%;width:100%;overflow:hidden;background:linear-gradient(262deg,#f8f2e2 0%,#eee3cb 66%,#ded0b2 100%);box-shadow:inset 0 0 0 1px rgba(120,100,70,0.16),inset 0 0 40px rgba(120,96,58,0.16)}
.verso.tone-dark{background:linear-gradient(262deg,#1b2c26 0%,#14211c 68%,#0e1815 100%);box-shadow:inset 0 0 0 1px rgba(231,201,138,0.14),inset 0 0 40px rgba(0,0,0,0.45)}
.show-through{position:absolute;inset:0;display:grid;place-items:center;padding:12%;text-align:center;transform:scaleX(-1);font-size:clamp(1.1rem,4.4vw,1.9rem);font-style:italic;letter-spacing:-0.02em;color:rgba(30,26,18,0.14);filter:blur(0.55px)}
.verso.tone-dark .show-through{color:rgba(231,201,138,0.13)}
.verso-folio{position:absolute;right:8%;bottom:7%;font-family:var(--font-mono);font-size:0.54rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(40,34,24,0.35)}
.verso.tone-dark .verso-folio{color:rgba(240,230,210,0.3)}

/* block render inside page faces */
.rm-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(1.5rem,6.2vw,2.6rem);line-height:0.92;letter-spacing:-0.045em;color:currentColor;white-space:pre-line;margin:0}
.rm-heading-sub{display:block;margin-top:0.45rem;font-family:var(--font-serif);font-weight:400;font-style:italic;font-size:0.62em;letter-spacing:0;opacity:0.7}
.rm-kicker{font-family:var(--font-mono);font-size:clamp(0.54rem,1.6vw,0.66rem);letter-spacing:0.3em;text-transform:uppercase;color:var(--kicker-color,#c0432c);margin:0}
.rm-text{font-family:var(--font-serif);color:currentColor;opacity:0.88;white-space:pre-line;margin:0}
.rm-quote{position:relative;padding:0.3rem 0 0.3rem 1.4rem;border-left:2px solid rgba(192,67,44,0.55);font-family:var(--font-serif);margin:0}
.rm-quote>span{position:absolute;left:0.15rem;top:-0.2rem;font-size:2rem;line-height:1;color:rgba(192,67,44,0.5)}
.rm-quote p{font-size:clamp(1rem,3.8vw,1.5rem);font-style:italic;line-height:1.28;letter-spacing:-0.02em;color:currentColor;margin:0}
.rm-quote cite{display:block;margin-top:0.4rem;font-family:var(--font-mono);font-style:normal;font-size:0.58rem;letter-spacing:0.2em;text-transform:uppercase;opacity:0.6}
.rm-rule{height:1px;flex:none;background:linear-gradient(90deg,rgba(192,67,44,0.85),rgba(120,100,70,0.3) 62%,transparent)}
.rm-rule-bold{height:2px;background:linear-gradient(90deg,transparent,#e7c98a 12%,#fff3d2 38%,#b78f4c 62%,#e7c98a 82%,transparent)}
.rm-divider{display:flex;align-items:center;gap:0.7rem;color:currentColor;opacity:0.62}
.rm-divider span{flex:1;height:1px;background:currentColor;opacity:0.3}
.rm-divider em{font-family:var(--font-mono);font-style:normal;font-size:0.58rem;letter-spacing:0.24em;text-transform:uppercase;white-space:nowrap}
.rm-note{padding:0.5rem 0.7rem;border-left:2px solid rgba(192,67,44,0.6);background:rgba(192,67,44,0.07);font-family:var(--font-mono);font-size:clamp(0.56rem,1.7vw,0.72rem);line-height:1.55;letter-spacing:0.02em;text-transform:uppercase;opacity:0.82}
.page-face-compose.dark .rm-note{border-left-color:rgba(231,201,138,0.6);background:rgba(231,201,138,0.08)}
.rm-media{flex:none;width:100%;margin:0}
.rm-media img,.rm-media video{display:block;width:100%;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(120,100,70,0.24),0 10px 24px rgba(60,40,16,0.22)}
.rm-media-cover img,.rm-media-cover video{height:clamp(130px,34vh,230px);object-fit:cover}
.rm-media-contain img,.rm-media-contain video{height:clamp(130px,34vh,230px);object-fit:contain;background:rgba(0,0,0,0.04)}
.rm-media-natural img,.rm-media-natural video{height:auto;object-fit:contain}
.rm-media figcaption{margin-top:0.35rem;font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.1em;text-transform:uppercase;opacity:0.6;text-align:center}
.rm-numbers{display:grid;grid-template-columns:repeat(auto-fit,minmax(60px,1fr));gap:clamp(0.5rem,2vw,1rem);padding:clamp(0.6rem,2vw,1rem) 0;border-top:1px solid rgba(120,100,70,0.25);border-bottom:1px solid rgba(120,100,70,0.25)}
.rm-num{display:flex;flex-direction:column;gap:0.15rem;text-align:center}
.rm-num strong{font-family:var(--font-display);font-weight:800;font-size:clamp(1.3rem,5vw,2.1rem);letter-spacing:-0.04em;color:var(--color-marker);line-height:1}
.rm-num span{font-family:var(--font-mono);font-size:0.54rem;letter-spacing:0.18em;text-transform:uppercase;opacity:0.6}
.rm-chart{flex:none;width:100%;margin:0}
.rm-chart-title{font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.14em;text-transform:uppercase;opacity:0.6;margin-bottom:0.3rem}
.rm-chart-box{position:relative;height:clamp(110px,26vh,190px);padding:0.4rem;border-radius:5px;background:rgba(255,255,255,0.42);box-shadow:inset 0 0 0 1px rgba(120,100,70,0.2)}
.page-face-compose.dark .rm-chart-box{background:rgba(255,255,255,0.06);box-shadow:inset 0 0 0 1px rgba(231,201,138,0.2)}
.rm-chart-static{display:grid;place-items:center;width:100%;height:100%}
.rm-chart-static-inner{width:100%;height:100%;display:grid;place-items:center;gap:8px}
.static-bars{display:flex;align-items:flex-end;gap:5px;height:100%;width:100%;justify-content:center;padding-bottom:0.5rem}
.static-bars i{display:block;flex:1;max-width:32px;border-radius:3px 3px 0 0;background:linear-gradient(180deg,#2c6f63,#55a08c)}
.static-bars i:nth-child(3),.static-bars i:nth-child(5){background:linear-gradient(180deg,#d99b2b,#f0c56a)}
.static-bars i:nth-child(5){background:linear-gradient(180deg,#c0432c,#e07a6a)}
.static-line-svg{width:100%;height:100%;display:block}
.static-chart-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.55;text-align:center}
.rm-cover{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;color:#f0dcae;padding-bottom:2%}
.rm-cover-crest{position:absolute;top:0;right:0;width:34%;aspect-ratio:1}
.rm-cover-crest svg{width:100%;height:100%;fill:none;stroke:rgba(231,201,138,0.36);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 1px 0 rgba(0,0,0,0.55))}
.crest-dash{stroke-width:1.5;stroke-dasharray:3 7}
.rm-cover-edition{position:absolute;top:0;right:0;font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.26em;text-transform:uppercase;color:#f0dcae;opacity:0.85}
.rm-cover-body{display:flex;flex-direction:column}
.rm-cover-rule{height:2px;background:linear-gradient(90deg,transparent,#e7c98a 12%,#fff3d2 38%,#b78f4c 62%,#e7c98a 82%,transparent);box-shadow:0 1px 0 rgba(0,0,0,0.45)}
.rm-cover-title{font-family:var(--font-display);font-weight:800;font-size:clamp(2.2rem,11vw,4rem);line-height:0.86;letter-spacing:-0.045em;text-transform:uppercase;white-space:pre-line;margin:4% 0;color:#f0d9a4;text-shadow:0 1px 0 rgba(0,0,0,0.5)}
.rm-cover-subtitle{font-family:var(--font-serif);font-style:italic;font-size:clamp(0.74rem,2.2vw,0.98rem);line-height:1.5;color:rgba(239,224,194,0.85);max-width:88%;margin-top:4%}

/* extended (Elementor-style) elements — static snapshot styling */
.rm-flex{display:flex;flex-wrap:wrap}
.rm-flex-cell,.rm-inner-col{flex:1 1 0;min-width:0;padding:0.55rem 0.65rem;border-radius:6px;background:rgba(120,100,70,0.08);box-shadow:inset 0 0 0 1px rgba(120,100,70,0.16);font-family:var(--font-serif);font-size:0.78rem}
.rm-inner-section{display:grid;gap:0.5rem}
.rm-btn-wrap{width:100%}
.rm-button{display:inline-block;padding:0.42rem 0.95rem;border-radius:6px;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;border:1.5px solid var(--kicker-color,#c0432c);text-decoration:none;color:inherit;transition:transform 0.2s,background 0.2s,color 0.2s}
.rm-button-solid{background:var(--kicker-color,#c0432c);color:#fff}
.rm-button-outline{background:transparent;color:var(--kicker-color,#c0432c)}
.rm-button-ghost{background:transparent;border-color:transparent;color:var(--kicker-color,#c0432c);text-decoration:underline}
.rm-button:hover{transform:translateY(-1px)}
.rm-spacer{width:100%}
.rm-embed{width:100%;border-radius:6px;overflow:hidden}
.rm-embed iframe{display:block;width:100%;height:clamp(140px,26vh,220px);border:0;background:rgba(0,0,0,0.15)}
.rm-embed[style*="height"] iframe{height:100%}
.rm-icon-single{display:flex;flex-direction:column;align-items:center;gap:0.3rem;line-height:1;color:var(--kicker-color,#c0432c)}
.rm-icon-single em{font-size:0.56rem;font-style:normal;letter-spacing:0.12em;text-transform:uppercase;opacity:0.7;color:currentColor}
.rm-image-box img{width:100%;height:clamp(96px,18vh,150px);object-fit:cover;border-radius:6px}
.rm-image-box figcaption{display:flex;flex-direction:column;gap:0.18rem;margin-top:0.4rem}
.rm-image-box strong{font-family:var(--font-display);font-size:0.92rem}
.rm-image-box span,.rm-icon-box span{font-family:var(--font-serif);font-size:0.76rem;opacity:0.82}
.rm-icon-box{display:flex;gap:0.6rem;align-items:flex-start}
.rm-ib-glyph{font-size:1.5rem;line-height:1;color:var(--kicker-color,#c0432c);flex:none}
.rm-icon-box strong{display:block;font-family:var(--font-display);font-size:0.88rem;margin-bottom:0.12rem}
.rm-carousel{position:relative;width:100%;border-radius:6px;overflow:hidden}
.rm-carousel-track img{width:100%;height:clamp(110px,22vh,180px);object-fit:cover;display:block}
.rm-car-btn{position:absolute;top:50%;transform:translateY(-50%);width:24px;height:24px;border-radius:999px;border:0;background:rgba(0,0,0,0.5);color:#fff;font-size:0.95rem;cursor:pointer;display:grid;place-items:center}
.rm-car-prev{left:6px}.rm-car-next{right:6px}
.rm-car-dots{display:flex;justify-content:center;gap:4px;padding:0.35rem 0}
.rm-car-dots i{width:6px;height:6px;border-radius:999px;background:rgba(120,100,70,0.35)}
.rm-car-dots i.on{background:var(--kicker-color,#c0432c)}
.rm-gallery{display:grid;gap:0.35rem}
.rm-gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:5px}
.rm-icon-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.35rem}
.rm-icon-list li{display:flex;align-items:baseline;gap:0.5rem;font-family:var(--font-serif);font-size:0.8rem}
.rm-il-glyph{color:var(--kicker-color,#2c6f63);font-weight:700;flex:none}
.rm-counter{text-align:center}
.rm-counter strong{display:block;font-family:var(--font-display);font-weight:800;font-size:clamp(1.5rem,5vw,2.4rem);letter-spacing:-0.04em;color:var(--kicker-color,#c0432c);line-height:1}
.rm-counter span{font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.18em;text-transform:uppercase;opacity:0.65}
.rm-testimonial blockquote,.rm-tcar blockquote{font-family:var(--font-serif);font-style:italic;font-size:clamp(0.85rem,2.6vw,1.1rem);line-height:1.35;margin:0}
.rm-testimonial figcaption{display:flex;align-items:center;gap:0.55rem;margin-top:0.5rem}
.rm-testimonial figcaption img{width:30px;height:30px;border-radius:999px;object-fit:cover}
.rm-testimonial figcaption strong{display:block;font-family:var(--font-display);font-size:0.8rem}
.rm-testimonial figcaption em{font-size:0.66rem;font-style:normal;opacity:0.65}
.rm-tabs{width:100%}
.rm-tab-strip{display:flex;gap:0.2rem;border-bottom:1px solid rgba(120,100,70,0.28)}
.rm-tab{padding:0.35rem 0.6rem;border:0;background:transparent;color:inherit;font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.06em;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;opacity:0.6}
.rm-tab-on{opacity:1;border-bottom-color:var(--kicker-color,#c0432c)}
.rm-tab-panel{padding:0.5rem 0.2rem;font-family:var(--font-serif);font-size:0.8rem;line-height:1.5}
.rm-accordion{display:flex;flex-direction:column;gap:0.3rem;width:100%}
.rm-acc-item{border:1px solid rgba(120,100,70,0.22);border-radius:6px;overflow:hidden}
.rm-acc-head{width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.45rem 0.6rem;border:0;background:rgba(120,100,70,0.06);color:inherit;font-family:var(--font-display);font-size:0.8rem;cursor:pointer}
.rm-acc-sign{font-family:var(--font-mono);opacity:0.6}
.rm-acc-body{padding:0.45rem 0.6rem;font-family:var(--font-serif);font-size:0.78rem;line-height:1.5}
.dark-theme .rm-form input,.dark-theme .rm-form textarea{background:rgba(0,0,0,0.25);color:#f2e8d6}
.rm-social,.rm-share{display:flex;flex-wrap:wrap;gap:0.45rem}
.rm-social-icon{display:grid;place-items:center;width:30px;height:30px;border-radius:999px;background:var(--kicker-color,#c0432c);color:#fff;font-family:var(--font-mono);font-size:0.72rem;font-weight:700}
.rm-share-btn{display:inline-flex;align-items:center;gap:0.35rem;padding:0.26rem 0.55rem;border-radius:5px;background:rgba(120,100,70,0.1);font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.06em}
.rm-share-btn i{font-style:normal;font-weight:700;color:var(--kicker-color,#c0432c)}
.rm-sidebar{border-left:3px solid var(--kicker-color,#c0432c);padding-left:0.7rem}
.rm-sidebar strong{display:block;font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.2em;text-transform:uppercase;opacity:0.7;margin-bottom:0.35rem}
.rm-sidebar ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.22rem;font-family:var(--font-serif);font-size:0.8rem}
.rm-textpath text{fill:var(--kicker-color,#c0432c);font-family:var(--font-display);font-size:15px;font-weight:700;letter-spacing:0.02em}
.rm-form{display:flex;flex-direction:column;gap:0.35rem;width:100%}
.rm-form-title{font-family:var(--font-display);font-size:0.9rem}
.rm-form input,.rm-form textarea{width:100%;padding:0.4rem 0.55rem;border-radius:5px;border:1px solid rgba(120,100,70,0.3);background:rgba(255,255,255,0.5);font-family:var(--font-serif);font-size:0.76rem;color:#1d1e19}
.rm-cta{position:relative;border-radius:8px;overflow:hidden;background-size:cover;background-position:center;color:#fff}
.rm-cta-inner{display:flex;flex-direction:column;align-items:flex-start;gap:0.45rem;padding:1rem 0.9rem;background:linear-gradient(120deg,rgba(12,8,4,0.72),rgba(12,8,4,0.35))}
.rm-cta-inner strong{font-family:var(--font-display);font-size:clamp(1rem,3.4vw,1.45rem);line-height:1.05}
.rm-cta-inner span{font-family:var(--font-serif);font-size:0.8rem;opacity:0.9}
.rm-cta-inner .rm-button-solid{background:#fff;color:#1d1e19;border-color:#fff}
.rm-flipbox{width:100%;perspective:900px}
.rm-flip-inner{position:relative;height:clamp(130px,24vh,180px);transition:transform 0.7s;transform-style:preserve-3d}
.rm-flipbox:hover .rm-flip-inner{transform:rotateY(180deg)}
.rm-flip-front,.rm-flip-back{position:absolute;inset:0;backface-visibility:hidden;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.35rem;padding:0.9rem;text-align:center}
.rm-flip-front{background:#1f3a31 center/cover;color:#fff;font-family:var(--font-display);font-size:1.1rem}
.rm-flip-back{background:var(--kicker-color,#c0432c);color:#fff;transform:rotateY(180deg)}
.rm-flip-back strong{font-family:var(--font-display);font-size:1rem}
.rm-flip-back span{font-family:var(--font-serif);font-size:0.78rem}
.rm-pricelist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.45rem}
.rm-pricelist li{display:grid;grid-template-columns:auto 1fr auto;align-items:baseline;gap:0.4rem}
.rm-pl-name{font-family:var(--font-display);font-size:0.85rem}
.rm-pl-dots{border-bottom:1px dotted rgba(120,100,70,0.5);transform:translateY(-3px)}
.rm-pl-price{font-family:var(--font-mono);font-weight:600;color:var(--kicker-color,#c0432c)}
.rm-pl-desc{grid-column:1/-1;font-family:var(--font-serif);font-style:italic;font-size:0.68rem;opacity:0.7}
.rm-pricetable{border:1px solid rgba(120,100,70,0.25);border-radius:10px;padding:0.9rem;text-align:center;display:flex;flex-direction:column;gap:0.55rem}
.rm-pt-featured{border-color:var(--kicker-color,#c0432c);box-shadow:0 8px 24px rgba(0,0,0,0.14)}
.rm-pt-plan{font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.2em;text-transform:uppercase;opacity:0.7}
.rm-pt-price{display:block;font-family:var(--font-display);font-weight:800;font-size:1.8rem;color:var(--kicker-color,#c0432c)}
.rm-pt-price em{font-size:0.85rem;font-style:normal;opacity:0.6}
.rm-pricetable ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.3rem;font-family:var(--font-serif);font-size:0.78rem}
.rm-pricetable ul li{padding-bottom:0.3rem;border-bottom:1px solid rgba(120,100,70,0.14)}
.rm-animated-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(1.2rem,4.4vw,1.9rem);line-height:1.05;letter-spacing:-0.03em;margin:0}
.rm-ah-word{color:var(--kicker-color,#c0432c);display:inline-block}
.rm-tcar{text-align:center}
.rm-tcar cite{display:block;margin-top:0.35rem;font-family:var(--font-mono);font-style:normal;font-size:0.6rem;letter-spacing:0.14em;text-transform:uppercase;opacity:0.7}
.rm-reviews{display:flex;flex-direction:column;gap:0.55rem}
.rm-review{padding:0.55rem 0.6rem;border-radius:6px;background:rgba(120,100,70,0.08)}
.rm-review-stars{color:#e6a817;letter-spacing:2px;font-size:0.8rem}
.rm-review p{font-family:var(--font-serif);font-size:0.8rem;margin:0.18rem 0}
.rm-review cite{font-family:var(--font-mono);font-style:normal;font-size:0.58rem;opacity:0.7}
.rm-facebook{display:flex;align-items:center;gap:0.6rem;padding:0.6rem;border:1px solid rgba(120,100,70,0.22);border-radius:8px}
.rm-fb-badge{display:grid;place-items:center;width:36px;height:36px;border-radius:8px;background:#1877f2;color:#fff;font-family:var(--font-display);font-weight:800;font-size:1.2rem;flex:none}
.rm-facebook strong{display:block;font-family:var(--font-display);font-size:0.85rem}
.rm-facebook span{font-size:0.66rem;opacity:0.65}
.rm-fb-like{margin-left:auto;padding:0.3rem 0.55rem;border:0;border-radius:5px;background:#1877f2;color:#fff;font-size:0.66rem;cursor:pointer}
.rm-lottie{display:flex;flex-direction:column;align-items:center;gap:0.35rem;padding:0.7rem 0}
.rm-lottie-orb{width:54px;height:54px;border-radius:999px;background:radial-gradient(circle at 35% 30%,#ffd78d,var(--kicker-color,#c0432c))}
.rm-lottie-pulse{animation:lotPulse 1.6s ease-in-out infinite}
.rm-lottie-orbit{animation:lotOrbit 2.4s linear infinite}
.rm-lottie-bounce{animation:lotBounce 1.2s ease-in-out infinite}
@keyframes lotPulse{0%,100%{transform:scale(0.85);opacity:0.7}50%{transform:scale(1.1);opacity:1}}
@keyframes lotOrbit{to{transform:rotate(360deg)}}
@keyframes lotBounce{0%,100%{transform:translateY(6px)}50%{transform:translateY(-8px)}}
.rm-countdown{text-align:center}
.rm-cd-title{font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.2em;text-transform:uppercase;opacity:0.7;margin-bottom:0.45rem}
.rm-cd-grid{display:flex;justify-content:center;gap:0.45rem}
.rm-cd-cell{display:flex;flex-direction:column;align-items:center;min-width:42px;padding:0.45rem 0.28rem;border-radius:6px;background:rgba(120,100,70,0.1)}
.rm-cd-cell b{font-family:var(--font-display);font-weight:800;font-size:1.3rem;color:var(--kicker-color,#c0432c);line-height:1}
.rm-cd-cell span{font-family:var(--font-mono);font-size:0.46rem;letter-spacing:0.14em;text-transform:uppercase;opacity:0.6}

/* TOC rows inside the book */
.toc-row{display:flex;align-items:baseline;gap:0.45rem;width:100%;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer;padding:0.12rem 0.2rem;border-radius:3px;font-family:var(--font-serif);transition:color 0.25s,transform 0.25s,background 0.25s}
.toc-row:hover{color:var(--color-foil);background:rgba(231,201,138,0.08);transform:translateX(3px)}
.toc-n{font-family:var(--font-mono);font-size:0.6rem;opacity:0.55}
.toc-t{font-family:var(--font-display);font-weight:600;font-size:clamp(0.72rem,1.9vw,0.85rem)}
.toc-dots{flex:1;border-bottom:1px dotted rgba(240,230,210,0.28);translate:0 -3px}
.toc-l{font-family:var(--font-mono);font-size:0.6rem;opacity:0.7}
.dark-theme .toc-row:hover{background:rgba(255,255,255,0.08)}
.light-theme .toc-row:hover{color:var(--color-marker);background:rgba(192,67,44,0.08)}

/* present fullscreen */
/* full-screen uses the full viewport as the book, not a boxed page */
}
/* ---- full-screen fill: keep shell as the viewport ---- */
@supports (height:100dvh){.shell{min-height:100dvh}}
/* ---- responsive: tablet + phone ---- */
@media (max-width:1080px){
  .grid{grid-template-columns:1fr;gap:clamp(0.7rem,2vw,1.2rem)}
  .rail-left{display:none}
.stage{order:2;min-height:min(58vh,560px)}
  }
@media (max-width:720px){
  .shell{grid-template-rows:auto 1fr auto;gap:clamp(0.5rem,2vw,0.8rem);padding:clamp(0.6rem,3vw,0.9rem) clamp(0.6rem,3vw,0.9rem) clamp(0.45rem,2vw,0.8rem)}
  .top-bar{flex-direction:column;align-items:stretch}
  .brand-title{font-size:clamp(1.15rem,6vw,1.55rem)}
  .top-meta{gap:0.55rem}
  .meta-cell{min-width:0;flex:1}
  .meta-val{font-size:0.78rem}
  .progress-track{width:auto;min-width:64px}
  .grid{gap:0.7rem}
  .stage{padding:0.2rem 0}
  .book{--bw:clamp(220px,min(86vw,44svh),392px)}
  .dock{justify-content:center;gap:0.45rem}
  .dock-group{gap:0.28rem}
  .ctl{min-width:32px;height:32px;padding-inline:0.38rem}
  .dock-read{display:none}
  .dock-hint{display:none!important}
  .ribbon{right:-9px;height:32px}
  .hint{bottom:-2px;font-size:0.5rem;letter-spacing:0.14em;text-align:center;max-width:88vw}
  }
@media (max-width:420px){
  .book{--bw:min(88vw,40svh)}
  .top-meta .meta-cell:nth-child(2){display:none}
  .meta-cell{padding-left:0.45rem}
}
@media (max-height:640px) and (min-width:721px){
  .shell{padding-block:0.55rem}
  .stage{padding:0}
  .rail-note{display:none}
  .rail{justify-content:flex-start}
}
/* coarse pointer: larger hit targets */
@media (pointer:coarse){
  .ctl{min-height:38px}
  }
/* reduced motion */
@media (prefers-reduced-motion:reduce){
  .book-hang{animation:none}
  .hint{animation:none}
  }
/* focus */
:focus-visible{outline:2px solid var(--color-foil);outline-offset:2px}
::selection{background:rgba(231,201,138,0.35);color:#17251f}
`;

  // Flip engine JS
  const JS = `
(function(){
  var pages = [${pagesJs.join(",")}];
  var N = pages.length;
  var idx = 0, busy = false, dragging = false, flipping = null, p = 0, snapping = false;
  var auto = false, touched = false, vertical = ${isVertical ? "true" : "false"}, duration = ${DURATION};
  var startX = 0, lastDx = 0, timer = null;

  var book = document.getElementById("book");
  var stage = document.getElementById("stage");
  var dockTitle = document.getElementById("dock-title");
  var dockNum = document.getElementById("dock-num");
  var progressFill = document.getElementById("progress-fill");
  var ribbon = document.getElementById("ribbon");
  var leftCount = document.getElementById("left-count");
  var rightCount = document.getElementById("right-count");
  var hint = document.getElementById("hint");

  function clamp01(v){ return Math.min(Math.max(v,0),1); }

  function updateUI(){
    var pg = pages[idx];
    // footer dock — matches Reader: "Cover closed" / "Back cover" / "Page XX" + title
    dockTitle.textContent = idx === 0 ? "Cover closed" : idx === N-1 ? "Back cover" : "Page " + String(idx+1).padStart(2,"0");
    var el = document.getElementById("dock-title-text");
    if(el) el.textContent = pg ? pg.title : "";
    // header sheet indicator
    dockNum.textContent = idx === 0 ? "Cover closed" : idx === N-1 ? "Back cover" : String(idx+1).padStart(2,"0") + "/" + String(N).padStart(2,"0");
    // progress — Reader uses p*0.06 on the cover so the bar nudges on first drag
    var prog = N<=1 ? 0 : (idx === 0 ? p * 0.06 : (idx + p) / (N-1));
    progressFill.style.transform = "scaleX(" + prog + ")";
    var pctEl = document.getElementById("turned-pct");
    if(pctEl) pctEl.textContent = N<=1 ? "0%" : Math.round((idx / (N-1)) * 100) + "%";
    ribbon.style.top = (8 + (idx / Math.max(N-1,1)) * 66) + "%";
    if(curlLabel) curlLabel.textContent = busy ? Math.round(p * 180) + "°" : "0°";
    if(leftCount) leftCount.innerHTML = "";
    // dynamic edges — use the current flip state, never a bare reference
    var cur = flipping;
    var lc = Math.max(cur ? (cur.dir === "fwd" ? idx : cur.sheet) : idx, 0);
    var rc = Math.max(N - (cur ? (cur.dir === "fwd" ? Math.min(cur.sheet+1,N-1) : cur.sheet) : idx) - 1, 0) + 1;
    var er = document.querySelector(".edges-right");
    var el2 = document.querySelector(".edges-left");
    if(er) er.style.setProperty("--edge-size", (rc * 1.05 + 5) + "px");
    if(el2) el2.style.setProperty("--edge-size", (lc * 1.05 + 5) + "px");
    if(rightCount) rightCount.innerHTML = "";
    if(leftCount){ for(var i=0;i<Math.min(lc,10);i++){ var e=document.createElement("i"); leftCount.appendChild(e); } }
    if(rightCount){ for(var i=0;i<Math.min(rc,10);i++){ var e=document.createElement("i"); rightCount.appendChild(e); } }
      function renderFace(pg, verso){
    if(!pg) return '<div class="face-blank"></div>';
    if(verso) return pg.verso;
    return pg.front;
  }

  function setBookVars(){
    book.style.setProperty("--p", p);
    book.style.setProperty("--dur", duration + "ms");
  }

  function render(){
    var flip = window._flip;
    var sp = window._p;
    var staticI = flip ? (flip.dir === "fwd" ? Math.min(flip.sheet+1,N-1) : idx) : idx;
    var sheetI = flip ? flip.sheet : idx;
    var page = pages[staticI];
    var turning = pages[sheetI];
    var mag = flip ? (flip.dir === "fwd" ? 180*sp : 180*(1-sp)) : 0;
    var angle = vertical ? mag : -mag;

    document.getElementById("static-face").innerHTML = renderFace(page, false);
    document.getElementById("static-page").className = "static-page tone-" + (page?page.tone:"") + " " + (staticI===0||staticI===N-1 ? "is-board" : "");

    var sheetEl = document.getElementById("sheet");
    if(flip){
      sheetEl.style.display = "";
      sheetEl.style.setProperty("--p", sp);
      sheetEl.style.setProperty("--dur", duration + "ms");
      sheetEl.className = "sheet " + (snapping ? "snap" : "live") + " " + (sheetI===0||sheetI===N-1 ? "sheet-cover" : "");
      sheetEl.style.transform = "translateZ(calc(" + sp + " * (1 - " + sp + ") * 104px)) " + (vertical ? "rotateX(" + angle + "deg)" : "rotateY(" + angle + "deg)");
      document.getElementById("sheet-front").innerHTML = renderFace(turning, false);
      document.getElementById("sheet-back").innerHTML = renderFace(turning, true);
      book.setAttribute("data-dir", flip.dir);
    } else {
      sheetEl.style.display = "none";
      book.setAttribute("data-dir", "idle");
    }
    setBookVars();
    updateUI();
  }

  function finish(target){
    idx = Math.min(Math.max(target,0),N-1);
    window._flip = null;
    window._p = 0;
    flipping = null;
    p = 0;
    snapping = false;
    busy = false;
    render();
  }

  function runFlip(f, from, to, landOn){
    clearTimeout(timer);
    touched = true;
    busy = true;
    flipping = f;
    window._flip = f;
    p = from;
    window._p = from;
    snapping = true;
    dragging = false;
    render();
    requestAnimationFrame(function(){ p = to; window._p = to; render(); });
    timer = setTimeout(function(){
      if(to === 1) finish(landOn);
      else { flipping = null; window._flip = null; p = 0; window._p = 0; snapping = false; busy = false; render(); }
    }, duration + 90);
  }

  function next(){ if(busy || idx >= N-1) return; runFlip({dir:"fwd",sheet:idx}, 0.0001, 1, idx+1); }
  function prev(){ if(busy || idx <= 0) return; runFlip({dir:"back",sheet:idx-1}, 0.0001, 1, idx-1); }
  function goTo(t){
    t = Math.min(Math.max(t,0),N-1);
    if(busy || t === idx) return;
    if(t > idx) runFlip({dir:"fwd",sheet:idx}, 0.0001, 1, t);
    else runFlip({dir:"back",sheet:t}, 0.0001, 1, t);
  }

  // drag
  book.addEventListener("pointerdown", function(e){
    if(busy || e.button > 0) return;
    var rect = book.getBoundingClientRect();
    var rel = vertical ? (e.clientY - rect.top) / rect.height : (e.clientX - rect.left) / rect.width;
    var dir = rel < 0.34 ? "back" : "fwd";
    if(dir === "back" && idx <= 0) dir = "fwd";
    if(dir === "fwd" && idx >= N-1) dir = "back";
    if((dir === "fwd" && idx >= N-1) || (dir === "back" && idx <= 0)) return;
    startX = vertical ? e.clientY : e.clientX;
    lastDx = 0;
    dragging = true;
    touched = true;
    snapping = false;
    flipping = { dir: dir, sheet: dir === "fwd" ? idx : idx-1 };
    window._flip = flipping;
    p = 0; window._p = 0;
    book.setPointerCapture(e.pointerId);
    render();
  });

  book.addEventListener("pointermove", function(e){
    if(!dragging || !flipping || snapping) return;
    var rect = book.getBoundingClientRect();
    var span = (vertical ? rect.height : rect.width) * 0.82;
    var dx = (vertical ? e.clientY : e.clientX) - startX;
    lastDx = dx;
    p = flipping.dir === "fwd" ? clamp01(-dx/span) : clamp01(dx/span);
    window._p = p;
    render();
  });

  book.addEventListener("pointerup", function(e){
    if(!dragging) return;
    dragging = false;
    if(!flipping) return;
    var dragged = Math.abs(lastDx) > 6;
    var done = !dragged ? true : flipping.dir === "fwd" ? p > 0.4 : p > 0.6;
    runFlip(flipping, p, done ? 1 : 0, flipping.dir === "fwd" ? flipping.sheet+1 : flipping.sheet);
  });

  book.addEventListener("pointercancel", function(e){
    if(!dragging) return;
    dragging = false;
    if(!flipping) return;
    runFlip(flipping, p, p > 0.78 ? 1 : 0, flipping.dir === "fwd" ? flipping.sheet+1 : flipping.sheet);
  });

  // keyboard
  document.addEventListener("keydown", function(e){
    var tag = e.target.tagName;
    if(tag === "TEXTAREA" || tag === "INPUT" || e.target.isContentEditable) return;
    if((e.key === " " || e.key === "Enter") && tag === "BUTTON") return;
    if(e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " "){ e.preventDefault(); next(); }
    else if(e.key === "ArrowLeft" || e.key === "ArrowUp"){ e.preventDefault(); prev(); }
    else if(e.key === "Home") goTo(0);
    else if(e.key === "End") goTo(N-1);
  });

  // autoplay
  function scheduleAuto(){
    if(!auto) return;
    if(idx >= N-1){ auto = false; document.getElementById("auto-btn").classList.remove("ctl-on"); return; }
    setTimeout(function(){ next(); }, duration + 1500);
  }

  // buttons
  document.getElementById("prev-btn").addEventListener("click", prev);
  document.getElementById("next-btn").addEventListener("click", next);
  document.getElementById("first-btn").addEventListener("click", function(){ goTo(0); });
  document.getElementById("last-btn").addEventListener("click", function(){ goTo(N-1); });
  document.getElementById("auto-btn").addEventListener("click", function(){
    auto = !auto;
    this.classList.toggle("ctl-on", auto);
    var sp = this.querySelector("span");
    if(sp) sp.textContent = auto ? "pause" : "auto";
    if(auto) scheduleAuto();
  });
  document.getElementById("rewind-btn").addEventListener("click", function(){ goTo(0); });

  // TOC buttons inside page faces
  document.addEventListener("click", function(e){
    var btn = e.target.closest("[data-goto]");
    if(btn) goTo(parseInt(btn.getAttribute("data-goto"), 10));
  });

  // keyboard hint
  var prevHandler = function(){ if(hint) hint.style.opacity = "0"; };
  book.addEventListener("pointerdown", prevHandler);
  document.addEventListener("keydown", prevHandler);

  // observe auto complete
  var origNext = next;
  next = function(){ origNext(); if(auto) scheduleAuto(); };

  // init
  render();

  // ── auto-scale page content to fit ──────────────────────────────
  // When content overflows the page, scale the .page-blocks down
  // so everything stays visible without scroll or clipping.
  function scalePageContent(){
    var face = document.getElementById("static-face");
    if(!face) return;
    var pb = face.querySelector(".page-blocks");
    if(!pb) return;
    // reset scale before measuring
    pb.style.transform = "";
    pb.style.transformOrigin = "top left";
    pb.style.width = "100%";
    // measure available height (page face height minus padding)
    var fh = face.clientHeight;
    var style = window.getComputedStyle(pb);
    var pt = parseFloat(style.paddingTop) || 0;
    var pb2 = parseFloat(style.paddingBottom) || 0;
    var avail = fh - pt - pb2;
    if(avail <= 0) return;
    var need = pb.scrollHeight;
    if(need > avail + 2){
      var scale = avail / need;
      pb.style.transform = "scale(" + scale + ")";
      pb.style.height = (avail / scale) + "px";
    } else {
      pb.style.height = "";
    }
  }
  // run after each flip completes
  var origFinish = finish;
  finish = function(target){
    origFinish(target);
    requestAnimationFrame(scalePageContent);
  };
  // also run on first render and window resize
  requestAnimationFrame(scalePageContent);
  window.addEventListener("resize", function(){ requestAnimationFrame(scalePageContent); });
  // re-scale after the CSS transition finishes (snap animation)
  setInterval(function(){ if(!busy) scalePageContent(); }, 600);
})();
`;


  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>${esc(session.title)} — Flip Book</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
<style>${CSS}</style>
</head>
<body>




<main class="shell">
  <header class="top-bar">
    <div class="brand">
      <span class="brand-mark">☐</span>
      <div>
        <p class="brand-kicker font-mono">3D Flip Book · ${esc(session.edition)}</p>
        <h1 class="brand-title font-display">${esc(session.title)}<span style="color:var(--color-marker);font-style:normal">.</span></h1>
      </div>
    </div>
    <div class="top-meta font-mono">
      <div class="meta-cell">
        <span class="meta-key">sheet</span>
        <span class="meta-val" id="dock-num">Cover closed</span>
      </div>

      <div class="meta-cell">
        <span class="meta-key">turned</span>
        <div class="progress-track"><span class="progress-fill" id="progress-fill"></span></div>
        <span class="meta-val" id="turned-pct">0%</span>
      </div>
    </div>
  </header>

  <div class="grid" id="stage">
    <aside class="rail rail-left">
      <p class="vertical-label font-mono">Drag the page · snap it shut</p>
      <div class="stack-gauge">
        <div class="gauge-col">
          <span class="gauge-cap font-mono">left</span>
          <div class="gauge-stack" id="left-count"></div>
        </div>
        <div class="gauge-col">
          <span class="gauge-cap font-mono">right</span>
          <div class="gauge-stack" id="right-count"></div>
        </div>
      </div>
      <p class="rail-note font-serif">Paper thickness grows on the turned side as you read. The sheet bends on a live hinge, not a slide.</p>
    </aside>

    <div class="stage">
      <div class="table-shadow"></div>
      <div class="book-hang">
        <div id="book" class="book ${isVertical ? "axis-vertical" : "axis-horizontal"}" data-dir="idle">
          <div class="edges edges-right" style="--edge-size:6px"></div>
          <div class="edges edges-left" style="--edge-size:6px"></div>
          <div class="case"></div>
          <div class="spine-tape"></div>
          <div class="static-page" id="static-page">
            <div id="static-face"></div>
            <div class="gutter-shadow"></div>
            <div class="flight-shade"></div>
          </div>
          <div class="sheet" id="sheet" style="display:none">
            <div class="sheet-face face-front">
              <div class="face-inner" id="sheet-front"></div>
              <div class="curl-highlight"></div>
              <div class="curl-shade"></div>
            </div>
            <div class="sheet-face face-back">
              <div class="face-inner" id="sheet-back"></div>
              <div class="curl-highlight curl-highlight-back"></div>
              <div class="curl-shade curl-shade-back"></div>
            </div>
          </div>
          <div class="ribbon" id="ribbon" style="top:8%"></div>
        </div>
      </div>

      <div class="hint font-mono" id="hint">
        ${isVertical ? "drag the page up or down to turn it" : "drag the page sideways to turn it"}
      </div>
    </div>


  </div>

  <footer class="dock">
    <div class="dock-group">
      <button class="ctl" id="first-btn" aria-label="First page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
      </button>
      <button class="ctl" id="prev-btn" aria-label="Previous page">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="ctl" id="auto-btn" aria-label="Toggle auto turn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span style="font-family:var(--font-mono)">auto</span>
      </button>
      <button class="ctl" id="next-btn" aria-label="Next page">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button class="ctl" id="last-btn" aria-label="Last page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
      </button>
    </div>

    <p class="dock-read font-serif">
      <span class="dock-num font-display" id="dock-title">Cover closed</span>
      <span class="dock-title font-display" id="dock-title-text">${esc(ALL[0]?.title ?? "")}</span>
    </p>

    <div class="dock-group">
      <button class="ctl" id="rewind-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        <span style="font-family:var(--font-mono)">rewind</span>
      </button>
      <span class="dock-hint font-mono" style="display:inline-flex;align-items:center;gap:0.5rem">
        keys
        <kbd class="kbd">←</kbd>
        <kbd class="kbd">→</kbd>
        <kbd class="kbd">space</kbd>
      </span>
    </div>
  </footer>
</main>

<script>${JS}</script>
</body>
</html>`;
}

// ==================================================================
// triggers
// ==================================================================

export function downloadHtml(session: Session, filename = "index.html") {
  const html = buildExportHtml(session);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  triggerDownload(blob, filename);
}

export function downloadFlipBook(session: Session, filename = "flipbook.html") {
  const html = buildFlipBookHtml(session);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  triggerDownload(blob, filename);
}

export async function exportZip(
  session: Session,
  opts: { zipName?: string; includeJson?: boolean; format?: "static" | "flipbook" } = {}
): Promise<void> {
  const zip = new JSZip();
  const html = opts.format === "flipbook" ? buildFlipBookHtml(session) : buildExportHtml(session);
  const base = slugify(session.title) || "playbook";

  zip.file("index.html", html);

  if (opts.includeJson !== false) {
    zip.file("book.json", JSON.stringify(session, null, 2));
  }

  zip.file(
    "README.txt",
    `${session.title} — ${session.edition}\nExported ${new Date().toLocaleString()}\nPages: ${session.pages.length}\nFormat: ${opts.format === "flipbook" ? "3D Flip Book" : "Static scrollable"}\n\nOpen index.html in a browser, or deploy the whole folder to any static host.\n`
  );

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const zipName = (opts.zipName?.trim() ? opts.zipName.trim() : `${base}-export.zip`).replace(/\.zip$/i, "") + ".zip";
  triggerDownload(blob, zipName);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
