import { useEffect, useRef, useState } from "react";
import type { Block, GenericBlockType } from "./model";

/* helpers to read loosely-typed generic data */
const s = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const n = (v: unknown, d = 0) => (typeof v === "number" ? v : d);
const arr = <T,>(v: unknown, d: T[] = []) => (Array.isArray(v) ? (v as T[]) : d);

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, seen };
}

function Counter({ end, prefix, suffix, title }: { end: number; prefix: string; suffix: string; title: string }) {
  const { ref, seen } = useInView();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, end]);
  return (
    <div className="rm-counter" ref={ref}>
      <strong>
        {prefix}
        {val.toLocaleString()}
        {suffix}
      </strong>
      {title && <span>{title}</span>}
    </div>
  );
}

function Countdown({ target, title }: { target: string; title: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const sec = Math.floor((diff % 6e4) / 1000);
  const cell = (v: number, l: string) => (
    <div className="rm-cd-cell">
      <b>{String(v).padStart(2, "0")}</b>
      <span>{l}</span>
    </div>
  );
  return (
    <div className="rm-countdown">
      {title && <p className="rm-cd-title">{title}</p>}
      <div className="rm-cd-grid">
        {cell(d, "days")}
        {cell(h, "hrs")}
        {cell(m, "min")}
        {cell(sec, "sec")}
      </div>
    </div>
  );
}

function AnimatedHeadline({ before, words, after }: { before: string; words: string[]; after: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (words.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 2000);
    return () => clearInterval(id);
  }, [words.length]);
  return (
    <h3 className="rm-animated-headline">
      {before}{" "}
      <span className="rm-ah-word" key={i}>
        {words[i] ?? ""}
      </span>{" "}
      {after}
    </h3>
  );
}

function Tabs({ tabs }: { tabs: { title: string; body: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="rm-tabs" data-ui>
      <div className="rm-tab-strip">
        {tabs.map((t, i) => (
          <button
            key={i}
            data-ui
            className={`rm-tab ${i === active ? "rm-tab-on" : ""}`}
            onClick={() => setActive(i)}
          >
            {t.title}
          </button>
        ))}
      </div>
      <div className="rm-tab-panel">{tabs[active]?.body}</div>
    </div>
  );
}

function Accordion({ items, single }: { items: { title: string; body: string }[]; single?: boolean }) {
  const [open, setOpen] = useState<number | null>(single ? null : 0);
  return (
    <div className="rm-accordion" data-ui>
      {items.map((it, i) => (
        <div key={i} className={`rm-acc-item ${open === i ? "rm-acc-open" : ""}`}>
          <button data-ui className="rm-acc-head" onClick={() => setOpen(open === i ? null : i)}>
            <span>{it.title}</span>
            <span className="rm-acc-sign">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <div className="rm-acc-body">{it.body}</div>}
        </div>
      ))}
    </div>
  );
}

function Carousel({ images }: { images: string[] }) {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((v) => (v + d + images.length) % images.length);
  if (!images.length) return null;
  return (
    <div className="rm-carousel" data-ui>
      <div className="rm-carousel-track">
        <img src={images[i]} alt="" />
      </div>
      <button data-ui className="rm-car-btn rm-car-prev" onClick={() => go(-1)} aria-label="Previous">
        ‹
      </button>
      <button data-ui className="rm-car-btn rm-car-next" onClick={() => go(1)} aria-label="Next">
        ›
      </button>
      <div className="rm-car-dots">
        {images.map((_, k) => (
          <i key={k} className={k === i ? "on" : ""} />
        ))}
      </div>
    </div>
  );
}

function TestimonialCarousel({ items }: { items: { quote: string; author: string }[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length]);
  const it = items[i];
  if (!it) return null;
  return (
    <div className="rm-tcar">
      <blockquote>“{it.quote}”</blockquote>
      <cite>— {it.author}</cite>
      <div className="rm-car-dots">
        {items.map((_, k) => (
          <i key={k} className={k === i ? "on" : ""} />
        ))}
      </div>
    </div>
  );
}

const NET_GLYPH: Record<string, string> = {
  Twitter: "𝕏",
  Facebook: "f",
  LinkedIn: "in",
  Instagram: "◉",
  GitHub: "gh",
  Email: "✉",
  YouTube: "►",
};

function stars(n: number) {
  return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
}

export default function GenericBlockRenderer({ block }: { block: Block }) {
  const type = block.type as GenericBlockType;
  const d = block.data as Record<string, unknown>;

  switch (type) {
    case "flexContainer": {
      const items = arr<string>(d.items, []);
      return (
        <div
          className="rm-flex"
          style={{
            flexDirection: (s(d.direction, "row") as "row" | "column"),
            gap: n(d.gap, 12),
            alignItems: s(d.align, "stretch"),
            justifyContent: s(d.justify, "flex-start"),
          }}
        >
          {items.map((it, i) => (
            <div key={i} className="rm-flex-cell">
              {it}
            </div>
          ))}
        </div>
      );
    }
    case "innerSection": {
      const items = arr<string>(d.items, []);
      return (
        <div className="rm-inner-section" style={{ gridTemplateColumns: `repeat(${n(d.columns, 2)}, 1fr)` }}>
          {items.map((it, i) => (
            <div key={i} className="rm-inner-col">
              {it}
            </div>
          ))}
        </div>
      );
    }
    case "button":
      return (
        <div className="rm-btn-wrap" style={{ textAlign: s(d.align, "left") as "left" }}>
          <a className={`rm-button rm-button-${s(d.style, "solid")}`} href={s(d.href, "#")} data-ui onClick={(e) => e.preventDefault()}>
            {s(d.text, "Button")}
          </a>
        </div>
      );
    case "spacer":
      return <div className="rm-spacer" style={{ height: n(d.height, 32) }} aria-hidden />;
    case "gmap":
      return (
        <figure className="rm-media rm-embed">
          <iframe
            title="map"
            loading="lazy"
            src={`https://www.google.com/maps?q=${encodeURIComponent(s(d.query, "New York"))}&z=${n(d.zoom, 12)}&output=embed`}
          />
        </figure>
      );
    case "youtube":
      return (
        <figure className="rm-media rm-embed">
          <iframe
            title="youtube"
            loading="lazy"
            src={`https://www.youtube.com/embed/${s(d.videoId, "dQw4w9WgXcQ")}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {s(d.caption) && <figcaption>{s(d.caption)}</figcaption>}
        </figure>
      );
    case "icon":
      return (
        <div className="rm-icon-single" style={{ fontSize: n(d.size, 40) }}>
          <span>{s(d.glyph, "★")}</span>
          {s(d.label) && <em>{s(d.label)}</em>}
        </div>
      );
    case "imageBox":
      return (
        <figure className="rm-image-box" style={{ textAlign: s(d.align, "center") as "center" }}>
          <img src={s(d.src)} alt={s(d.title)} />
          <figcaption>
            <strong>{s(d.title)}</strong>
            <span>{s(d.body)}</span>
          </figcaption>
        </figure>
      );
    case "iconBox":
      return (
        <div className="rm-icon-box">
          <span className="rm-ib-glyph">{s(d.glyph, "◈")}</span>
          <div>
            <strong>{s(d.title)}</strong>
            <span>{s(d.body)}</span>
          </div>
        </div>
      );
    case "imageCarousel":
    case "mediaCarousel":
      return <Carousel images={arr<string>(d.images, [])} />;
    case "gallery": {
      const images = arr<string>(d.images, []);
      return (
        <div className="rm-gallery" style={{ gridTemplateColumns: `repeat(${n(d.columns, 2)}, 1fr)` }}>
          {images.map((src, i) => (
            <img key={i} src={src} alt="" loading="lazy" />
          ))}
        </div>
      );
    }
    case "iconList": {
      const items = arr<string>(d.items, []);
      return (
        <ul className="rm-icon-list">
          {items.map((it, i) => (
            <li key={i}>
              <span className="rm-il-glyph">{s(d.glyph, "✓")}</span>
              {it}
            </li>
          ))}
        </ul>
      );
    }
    case "counter":
      return <Counter end={n(d.end, 100)} prefix={s(d.prefix)} suffix={s(d.suffix)} title={s(d.title)} />;
    case "testimonial":
      return (
        <figure className="rm-testimonial">
          <blockquote>“{s(d.quote)}”</blockquote>
          <figcaption>
            {s(d.avatar) && <img src={s(d.avatar)} alt="" />}
            <span>
              <strong>{s(d.author)}</strong>
              {s(d.role) && <em>{s(d.role)}</em>}
            </span>
          </figcaption>
        </figure>
      );
    case "tabs":
      return <Tabs tabs={arr<{ title: string; body: string }>(d.tabs, [])} />;
    case "accordion":
      return <Accordion items={arr<{ title: string; body: string }>(d.items, [])} />;
    case "toggle":
      return <Accordion items={[{ title: s(d.title, "Toggle"), body: s(d.body) }]} single />;
    case "socialIcons":
      return (
        <div className="rm-social">
          {arr<string>(d.networks, []).map((net, i) => (
            <span key={i} className="rm-social-icon" title={net}>
              {NET_GLYPH[net] ?? net.slice(0, 2)}
            </span>
          ))}
        </div>
      );
    case "sidebar":
      return (
        <aside className="rm-sidebar">
          <strong>{s(d.title, "Widgets")}</strong>
          <ul>
            {arr<string>(d.items, []).map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </aside>
      );
    case "textPath":
      return (
        <div className="rm-textpath">
          <svg viewBox="0 0 300 80" width="100%">
            <defs>
              <path id={`tp-${block.id}`} d="M5,55 Q75,5 150,45 T295,35" fill="none" />
            </defs>
            <text>
              <textPath href={`#tp-${block.id}`} startOffset="0">
                {s(d.text, "Text on a path")}
              </textPath>
            </text>
          </svg>
        </div>
      );
    case "form":
      return (
        <form className="rm-form" data-ui onSubmit={(e) => e.preventDefault()}>
          {s(d.title) && <strong className="rm-form-title">{s(d.title)}</strong>}
          {arr<string>(d.fields, []).map((f, i) =>
            f.toLowerCase().includes("message") ? (
              <textarea key={i} placeholder={f} rows={2} data-ui />
            ) : (
              <input key={i} placeholder={f} data-ui />
            ),
          )}
          <button className="rm-button rm-button-solid" data-ui>
            {s(d.submit, "Submit")}
          </button>
        </form>
      );
    case "cta":
      return (
        <div className="rm-cta" style={{ backgroundImage: s(d.src) ? `url(${s(d.src)})` : undefined }}>
          <div className="rm-cta-inner">
            <strong>{s(d.title)}</strong>
            <span>{s(d.body)}</span>
            <a className="rm-button rm-button-solid" href="#" data-ui onClick={(e) => e.preventDefault()}>
              {s(d.button, "Learn more")}
            </a>
          </div>
        </div>
      );
    case "flipBox":
      return (
        <div className="rm-flipbox">
          <div className="rm-flip-inner">
            <div className="rm-flip-front" style={{ backgroundImage: s(d.front) ? `url(${s(d.front)})` : undefined }}>
              <span>{s(d.frontTitle, "Hover")}</span>
            </div>
            <div className="rm-flip-back">
              <strong>{s(d.backTitle)}</strong>
              <span>{s(d.backBody)}</span>
            </div>
          </div>
        </div>
      );
    case "priceList": {
      const items = arr<{ name: string; desc: string; price: string }>(d.items, []);
      return (
        <ul className="rm-pricelist">
          {items.map((it, i) => (
            <li key={i}>
              <span className="rm-pl-name">{it.name}</span>
              <span className="rm-pl-dots" />
              <span className="rm-pl-price">{it.price}</span>
              {it.desc && <em className="rm-pl-desc">{it.desc}</em>}
            </li>
          ))}
        </ul>
      );
    }
    case "priceTable":
      return (
        <div className={`rm-pricetable ${d.featured ? "rm-pt-featured" : ""}`}>
          <div className="rm-pt-head">
            <span className="rm-pt-plan">{s(d.plan, "Plan")}</span>
            <span className="rm-pt-price">
              {s(d.price)}
              <em>{s(d.period)}</em>
            </span>
          </div>
          <ul>
            {arr<string>(d.features, []).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          <a className="rm-button rm-button-solid" href="#" data-ui onClick={(e) => e.preventDefault()}>
            {s(d.button, "Choose")}
          </a>
        </div>
      );
    case "shareButtons":
      return (
        <div className="rm-share">
          {arr<string>(d.networks, []).map((net, i) => (
            <span key={i} className="rm-share-btn" title={`Share on ${net}`}>
              <i>{NET_GLYPH[net] ?? net.slice(0, 2)}</i>
              {net}
            </span>
          ))}
        </div>
      );
    case "animatedHeadline":
      return <AnimatedHeadline before={s(d.before)} words={arr<string>(d.words, [])} after={s(d.after)} />;
    case "testimonialCarousel":
      return <TestimonialCarousel items={arr<{ quote: string; author: string }>(d.items, [])} />;
    case "reviews": {
      const items = arr<{ stars: number; text: string; author: string }>(d.items, []);
      return (
        <div className="rm-reviews">
          {items.map((r, i) => (
            <div key={i} className="rm-review">
              <span className="rm-review-stars">{stars(r.stars)}</span>
              <p>{r.text}</p>
              <cite>— {r.author}</cite>
            </div>
          ))}
        </div>
      );
    }
    case "facebook":
      return (
        <div className="rm-facebook">
          <span className="rm-fb-badge">f</span>
          <div>
            <strong>{s(d.page, "Facebook Page")}</strong>
            <span>{s(d.mode) === "comments" ? "Comments plugin" : "Page plugin"}</span>
          </div>
          <button className="rm-fb-like" data-ui>
            👍 Like
          </button>
        </div>
      );
    case "lottie":
      return (
        <div className="rm-lottie">
          <div className={`rm-lottie-orb rm-lottie-${s(d.preset, "pulse")}`} />
          {s(d.caption) && <figcaption>{s(d.caption)}</figcaption>}
        </div>
      );
    case "countdown":
      return <Countdown target={s(d.target, new Date().toISOString())} title={s(d.title)} />;
    case "iframe":
      return (
        <figure className="rm-media rm-embed" style={{ height: n(d.height, 220) }}>
          <iframe title="embed" src={s(d.url, "https://example.com")} loading="lazy" />
        </figure>
      );
    default:
      return null;
  }
}
