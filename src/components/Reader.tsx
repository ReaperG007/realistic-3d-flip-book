import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  MoveHorizontal,
  MoveVertical,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useStore } from "../book/store";
import BlockRenderer from "../book/BlockRenderer";
import { DEFAULT_FLIP_SPEED, FLIP_SPEEDS, PAGE_PRESETS, type BookPage } from "../book/model";

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

const THICKNESS = 1.05;

type Dir = "fwd" | "back";
type Flip = { dir: Dir; sheet: number };

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

export default function Reader({
  interactive = true,
  presenting = false,
}: {
  interactive?: boolean;
  presenting?: boolean;
}) {
  const store = useStore();
  const pages = store.session.pages;
  const vertical = store.session.flipAxis === "vertical";
  const speedKey = store.session.flipSpeed ?? DEFAULT_FLIP_SPEED;
  const DURATION = FLIP_SPEEDS[speedKey]?.ms ?? FLIP_SPEEDS.slow.ms;

  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState<Flip | null>(null);
  const [p, setP] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [auto, setAuto] = useState(false);
  const [touched, setTouched] = useState(false);

  const bookRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const lastDx = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  const LAST = pages.length - 1;
  const busy = flip !== null;
  const canFwd = index < LAST;
  const canBack = index > 0;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // clamp index when pages are removed / reordered
  useEffect(() => {
    if (index > LAST) setIndex(Math.max(0, LAST));
  }, [LAST, index]);

  /* ---------------- flip engine ---------------- */

  const land = useCallback((target: number) => {
    setIndex(Math.min(Math.max(target, 0), LAST));
    setFlip(null);
    setP(0);
    setSnapping(false);
  }, []);

  /** swing the active sheet from `from` to `to`, landing the book on `landOn` */
  const runFlip = useCallback(
    (f: Flip, from: number, to: 0 | 1, landOn: number) => {
      window.clearTimeout(timer.current);
      setTouched(true);
      setFlip(f);
      setP(from);
      setSnapping(true);
      window.requestAnimationFrame(() => setP(to));
      timer.current = window.setTimeout(() => {
        if (to === 1) land(landOn);
        else {
          setFlip(null);
          setP(0);
          setSnapping(false);
        }
      }, DURATION + 90);
    },
    [land, DURATION],
  );

  const next = useCallback(() => {
    if (busy || !canFwd) return;
    runFlip({ dir: "fwd", sheet: index }, 0.0001, 1, index + 1);
  }, [busy, canFwd, index, runFlip]);

  const prev = useCallback(() => {
    if (busy || !canBack) return;
    runFlip({ dir: "back", sheet: index - 1 }, 0.0001, 1, index - 1);
  }, [busy, canBack, index, runFlip]);

  const goTo = useCallback(
    (target: number) => {
      const t = Math.min(Math.max(target, 0), LAST);
      if (busy || t === index) return;
      if (t > index) runFlip({ dir: "fwd", sheet: index }, 0.0001, 1, t);
      else runFlip({ dir: "back", sheet: t }, 0.0001, 1, t);
    },
    [busy, index, runFlip],
  );

  /* autoplay */
  useEffect(() => {
    if (!auto) return;
    if (!canFwd) {
      setAuto(false);
      return;
    }
    const id = window.setTimeout(() => next(), DURATION + 1500);
    return () => window.clearTimeout(id);
  }, [auto, canFwd, index, next]);

  /* keyboard */
  useEffect(() => {
    if (!interactive) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const tag = el?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || el.isContentEditable) return;
      if ((e.key === " " || e.key === "Enter") && tag === "BUTTON") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") goTo(0);
      else if (e.key === "End") goTo(LAST);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, next, prev, interactive]);

  /* ---------------- drag gestures ---------------- */

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || busy || e.button > 0) return;
    if ((e.target as HTMLElement).closest("[data-ui]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = vertical
      ? (e.clientY - rect.top) / rect.height
      : (e.clientX - rect.left) / rect.width;
    let dir: Dir = rel < 0.34 ? "back" : "fwd";
    if (dir === "back" && !canBack) dir = "fwd";
    if (dir === "fwd" && !canFwd) dir = "back";
    if ((dir === "fwd" && !canFwd) || (dir === "back" && !canBack)) return;

    startX.current = vertical ? e.clientY : e.clientX;
    lastDx.current = 0;
    setDragging(true);
    setTouched(true);
    setSnapping(false);
    setFlip({ dir, sheet: dir === "fwd" ? index : index - 1 });
    setP(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || !flip || snapping) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const span = (vertical ? rect.height : rect.width) * 0.82;
    const dx = (vertical ? e.clientY : e.clientX) - startX.current;
    lastDx.current = dx;
    setP(flip.dir === "fwd" ? clamp01(-dx / span) : clamp01(dx / span));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (!flip) return;
    const dragged = Math.abs(lastDx.current) > 6;
    /* the browser took the gesture (vertical scroll): only commit if the sheet is already past the point of return */
    const cancelled = e.type === "pointercancel";
    const done = cancelled
      ? p > 0.78
      : !dragged
        ? true
        : flip.dir === "fwd"
          ? p > 0.4
          : p > 0.6;
    runFlip(flip, p, done ? 1 : 0, flip.dir === "fwd" ? flip.sheet + 1 : flip.sheet);
  };

  /* ---------------- derived geometry ---------------- */

  const staticIndex = flip?.dir === "fwd" ? Math.min(flip.sheet + 1, LAST) : index;
  const sheetIndex = flip ? flip.sheet : index;
  const magnitude = flip ? (flip.dir === "fwd" ? 180 * p : 180 * (1 - p)) : 0;
  // vertical hinge (top edge) rotates on +X, horizontal hinge (left edge) on -Y
  const angle = vertical ? magnitude : -magnitude;
  const leftCount = Math.max(flip ? (flip.dir === "fwd" ? index : flip.sheet) : index, 0);
  const rightCount = Math.max(LAST - staticIndex, 0) + 1;

  const sheetVars = {
    "--p": p,
    "--dur": `${DURATION}ms`,
    transform: `translateZ(calc(var(--p) * (1 - var(--p)) * 104px)) ${
      vertical ? `rotateX(${angle}deg)` : `rotateY(${angle}deg)`
    }`,
  } as CSSProperties;

  const page = pages[staticIndex] as BookPage | undefined;
  const turning = pages[sheetIndex] as BookPage | undefined;

  const renderPageFace = (pg?: BookPage, verso = false) => {
    if (!pg) return <div className="face-blank" />;

    const preset =
      PAGE_PRESETS.find((p) => p.id === pg.bgPreset) ||
      (pg.tone === "dark"
        ? PAGE_PRESETS.find((p) => p.id === "dark")
        : pg.tone === "cover" || pg.tone === "closing"
        ? null
        : PAGE_PRESETS.find((p) => p.id === "cream"));

    let bgStyle: CSSProperties = {};
    let isDark = pg.tone === "dark" || pg.tone === "cover" || pg.tone === "closing";

    if (pg.customBgColor) {
      isDark = isColorDark(pg.customBgColor);
      bgStyle = {
        backgroundColor: pg.customBgColor,
        background: `radial-gradient(110% 80% at 15% 10%, rgba(255, 255, 255, ${isDark ? 0.12 : 0.65}), transparent 52%), ${pg.customBgColor}`,
        color: isDark ? "#f2e8d6" : "#1d1e19",
        ["--kicker-color" as string]: isDark ? "#e7c98a" : "#c0432c",
      };
    } else if (preset && pg.tone !== "cover" && pg.tone !== "closing") {
      isDark = preset.dark;
      bgStyle = {
        background: preset.background,
        color: preset.textColor,
        ["--kicker-color" as string]: preset.kickerColor ?? (preset.dark ? "#e7c98a" : "#c0432c"),
      };
    }

    return (
      <div
        className={`page-face-compose ${pg.tone} ${isDark ? "dark-theme" : "light-theme"} ${pg.bgPreset ? `preset-${pg.bgPreset}` : ""}`}
        style={bgStyle}
      >
        {pg.bgImage && (
          <div
            className="page-bg-image"
            style={{
              backgroundImage: `url(${pg.bgImage})`,
              opacity: (pg.bgImageOpacity ?? 40) / 100,
              backgroundSize: pg.bgImageFit === "tile" ? "auto" : (pg.bgImageFit ?? "cover"),
              backgroundRepeat: pg.bgImageFit === "tile" ? "repeat" : "no-repeat",
              backgroundPosition: "center center",
              mixBlendMode: pg.bgBlendMode ?? (isDark ? "screen" : "multiply"),
            }}
          />
        )}
        <div className="face-grain" />
        <div className="page-blocks">
          {pg.blocks
            .slice()
            .sort((a, z) => a.order - z.order)
            .map((blk) => (
              <BlockRenderer key={blk.id} block={blk} />
            ))}

          {pg.isIndexPage && (
            <div className="index-list-block mt-3" data-ui>
              <div className="rm-rule rm-rule-bold opacity-60 mb-3" />
              <ol className="tick-list pr-1 max-h-[34vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {pages
                  .map((p, idx) => ({ p, idx }))
                  .filter(({ idx }) => idx > 0 && idx < LAST)
                  .map(({ p, idx }) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        data-ui
                        className="index-row-interactive font-serif"
                        onClick={() => goTo(idx)}
                        title={`Flip to page: ${p.title}`}
                      >
                        <span className="font-mono text-[0.6rem] opacity-55">
                          {String(idx).padStart(2, "0")}
                        </span>
                        <span className="index-row-title text-[clamp(0.72rem,1.9vw,0.85rem)] font-medium">
                          {p.title}
                        </span>
                        <span className="index-dots" />
                        <span className="font-mono text-[0.6rem] opacity-70">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </button>
                    </li>
                  ))}
              </ol>
            </div>
          )}
        </div>
        {verso && <div className="show-through font-serif">{pg.title}</div>}
      </div>
    );
  };

  return (
    <div className={`reader-shell ${presenting ? "reader-presenting" : ""}`}>
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark font-display">
            <BookOpen size={17} />
          </span>
          <div>
            <p className="brand-kicker font-mono">Single-page 3D flip reader · {store.session.edition}</p>
            <h1 className="brand-title font-display">
              {store.session.title}
              <span className="reader-dot">.</span>
            </h1>
          </div>
        </div>

        <div className="top-meta font-mono">
          <div className="meta-cell">
            <span className="meta-key">sheet</span>
            <span className="meta-val">
              {String(index + 1).padStart(2, "0")}
              <i>/{String(pages.length).padStart(2, "0")}</i>
            </span>
          </div>
          <div className="meta-cell">
            <span className="meta-key">state</span>
            <span className={`meta-val ${busy ? "meta-live" : ""}`}>
              {busy ? (snapping ? "snapping" : "dragging") : "at rest"}
            </span>
          </div>
          <div className="meta-cell meta-progress">
            <span className="meta-key">turned</span>
            <span className="progress-track">
              <span className="progress-fill" style={{ transform: `scaleX(${index === 0 ? p * 0.06 : (index + p) / LAST})` }} />
            </span>
            <span className="meta-val">{Math.round((index / LAST) * 100)}%</span>
          </div>
        </div>
      </header>

      <div
        className="reader-grid"
        ref={stageRef}
        onPointerLeave={() => {
          const stage = stageRef.current;
          if (!stage) return;
          stage.style.setProperty("--tilt-x", "0deg");
          stage.style.setProperty("--tilt-y", "0deg");
        }}
      >
        {!presenting && (
        <aside className="rail rail-left">
          <p className="vertical-label font-mono">Drag the page · snap it shut</p>
          <div className="stack-gauge">
            <div className="gauge-col">
              <span className="gauge-cap font-mono">left</span>
              <div className="gauge-stack">
                {Array.from({ length: Math.min(leftCount, 10) }).map((_, i) => (
                  <i key={`l${i}`} />
                ))}
              </div>
            </div>
            <div className="gauge-col">
              <span className="gauge-cap font-mono">right</span>
              <div className="gauge-stack">
                {Array.from({ length: Math.min(rightCount, 10) }).map((_, i) => (
                  <i key={`r${i}`} />
                ))}
              </div>
            </div>
          </div>
          <p className="rail-note font-serif">
            Paper thickness grows on the turned side as you read. The sheet bends on a live hinge, not a slide.
          </p>
        </aside>
        )}

        <div className="stage">
          <div className="table-shadow" />
          <div className="book-hang">
          <div
            ref={bookRef}
            data-dir={flip?.dir ?? "idle"}
            className={`book ${vertical ? "axis-vertical" : "axis-horizontal"} ${busy ? "is-flipping" : ""} ${dragging ? "is-dragging" : ""}`}
            style={{ "--p": p } as CSSProperties}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* page block thickness */}
            <div className="edges edges-right" style={{ ["--edge-size" as string]: `${rightCount * THICKNESS + 5}px` }} />
            <div className="edges edges-left" style={{ ["--edge-size" as string]: `${leftCount * THICKNESS + 5}px` }} />

            {/* case / spine */}
            <div className="case" />
            <div className="spine-tape" />

            {/* resting page */}
            <div className={`static-page tone-${page?.tone} ${staticIndex === 0 || staticIndex === LAST ? "is-board" : ""}`}>
              {renderPageFace(page)}
              <div className="gutter-shadow" />
              <div className="flight-shade" />
            </div>

            {/* turning sheet */}
            {flip && (
              <div
                className={`sheet ${snapping ? "snap" : "live"} ${
                  sheetIndex === 0 || sheetIndex === LAST ? "sheet-cover" : ""
                }`}
                style={sheetVars}
              >
                <div className="sheet-face face-front">
                  <div className="face-inner">{renderPageFace(turning)}</div>
                  <div className="curl-highlight" />
                  <div className="curl-shade" />
                </div>
                <div className="sheet-face face-back">
                  <div className="face-inner">
                    <div
                      className={`verso tone-${turning?.tone} ${
                        turning?.tone === "dark" ||
                        turning?.bgPreset === "dark" ||
                        turning?.bgPreset === "midnight" ||
                        isColorDark(turning?.customBgColor)
                          ? "tone-dark"
                          : ""
                      }`}
                    >
                      <div className="face-grain" />
                      <div className="show-through font-serif">{turning?.title}</div>
                      <div className="verso-folio font-mono">verso · {turning?.label}</div>
                    </div>
                  </div>
                  <div className="curl-highlight curl-highlight-back" />
                  <div className="curl-shade curl-shade-back" />
                </div>
              </div>
            )}

            {/* bookmark ribbon rides the fore-edge */}
            <div className="ribbon" style={{ top: `${8 + (index / LAST) * 66}%` }} />
          </div>
          </div>

          {!touched && !presenting && (
            <div className="hint font-mono">
              <span className="hint-hand">
                {vertical ? <MoveVertical size={13} /> : <MoveHorizontal size={13} />}
              </span>
              {vertical ? "drag the page up or down to turn it" : "drag the page sideways to turn it"}
            </div>
          )}
        </div>

        {!presenting && (
        <aside className="rail rail-right">
          <p className="rail-head font-mono">Index</p>
          <ol className="tick-list">
            {pages.map((pg, i) => (
              <li key={pg.id}>
                <button
                  data-ui
                  className={`tick ${i === index ? "tick-on" : ""} ${i < index ? "tick-past" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${pg.label}`}
                >
                  <span className="tick-bar" />
                  <span className="tick-label font-serif">{pg.label}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="rail-block">
            <p className="rail-head font-mono">Curl</p>
            <div className="curl-meter">
              <div className="curl-meter-fill" style={{ height: `${(busy ? p : 0) * 100}%` }} />
            </div>
            <p className="rail-tiny font-mono">{busy ? `${Math.round(p * 180)}°` : "0°"}</p>
          </div>
        </aside>
        )}
      </div>

      <footer className="dock">
        <div className="dock-group">
          <button data-ui className="ctl" onClick={() => goTo(0)} disabled={index === 0 || busy} aria-label="First page">
            <ChevronsLeft size={16} />
          </button>
          <button data-ui className="ctl" onClick={prev} disabled={!canBack || busy} aria-label="Previous page">
            <ChevronLeft size={17} />
          </button>
          <button
            data-ui
            className={`ctl ctl-wide ${auto ? "ctl-on" : ""}`}
            onClick={() => setAuto((a) => !a)}
            aria-label="Toggle auto turn"
          >
            {auto ? <Pause size={15} /> : <Play size={15} />}
            <span className="font-mono">{auto ? "pause" : "auto"}</span>
          </button>
          <button data-ui className="ctl" onClick={next} disabled={!canFwd || busy} aria-label="Next page">
            <ChevronRight size={17} />
          </button>
          <button data-ui className="ctl" onClick={() => goTo(LAST)} disabled={index === LAST || busy} aria-label="Last page">
            <ChevronsRight size={16} />
          </button>
        </div>

        <p className="dock-read font-serif">
          <span className="dock-num font-display">
            {index === 0 ? "Cover closed" : index === LAST ? "Back cover" : `Page ${String(index).padStart(2, "0")}`}
          </span>
          <span className="dock-title font-display">{page?.title}</span>
        </p>

        <div className="dock-group">
          <button data-ui className="ctl ctl-wide" onClick={() => goTo(0)} disabled={busy}>
            <RotateCcw size={14} />
            <span className="font-mono">rewind</span>
          </button>
          <span className="dock-hint font-mono inline-flex items-center gap-1.5">
            keys
            <kbd className="kbd">{vertical ? <ArrowUp size={11} /> : <ArrowLeft size={11} />}</kbd>
            <kbd className="kbd">{vertical ? <ArrowDown size={11} /> : <ArrowRight size={11} />}</kbd>
            <kbd className="kbd">space</kbd>
          </span>
        </div>
      </footer>
    </div>
  );
}
