import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  GripVertical,
  Image as ImageIcon,
  Layers,
  MoveHorizontal,
  MoveVertical,
  Paintbrush,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useStore } from "../book/store";
import {
  blockIcon,
  blockLabel,
  templates,
  PAGE_PRESETS,
  BG_TEXTURES,
  DEFAULT_FLIP_SPEED,
  FLIP_SPEEDS,
  type Block,
  type BookPage,
  type FlipSpeed,
  type PageBgPreset,
} from "../book/model";

/* ------------------------------------------------------------------ */
/* stock library (images only)                                        */
/* ------------------------------------------------------------------ */

const STOCK = [
  { label: "Strategy", src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=640&q=70" },
  { label: "Stadium", src: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=640&q=70" },
  { label: "Notebook", src: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=70" },
  { label: "Mountain", src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=640&q=70" },
  { label: "Team", src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=640&q=70" },
  { label: "Workspace", src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=640&q=70" },
];

function StockPicker({ onPick }: { onPick: (url: string) => void }) {
  return (
    <div className="stock-picker">
      <p className="palette-title font-mono">Stock library</p>
      <div className="stock-grid">
        {STOCK.map((s) => (
          <button key={s.src} className="stock-item" onClick={() => onPick(s.src)}>
            <img src={s.src} alt={s.label} loading="lazy" />
            <span className="font-mono">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* block thumbnails                                                   */
/* ------------------------------------------------------------------ */

function BlockThumb({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return (
        <div className="thumb-line">
          <b>{block.data.title || "Heading"}</b>
          {block.data.sub ? <span>{block.data.sub}</span> : null}
        </div>
      );
    case "kicker":
      return <div className="thumb-kicker">{block.data.label}</div>;
    case "text":
      return <div className="thumb-lines">{block.data.body.slice(0, 160) || "Paragraph"}</div>;
    case "quote":
      return <div className="thumb-quote">“{block.data.text.slice(0, 90)}”</div>;
    case "image":
      return (
        <div className="thumb-media">
          <img src={block.data.src} alt="" />
        </div>
      );
    case "video":
      return (
        <div className="thumb-media thumb-video">
          <img src={block.data.cover || undefined} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
          <span>▶</span>
        </div>
      );
    case "chart":
      return (
        <div className="thumb-chart">
          <span className={`thumb-bars thumb-bars-${block.data.kind}`} />
          <em>{block.data.title || (block.data.kind === "line" ? "Line chart" : "Bar chart")}</em>
        </div>
      );
    case "numbers":
      return (
        <div className="thumb-numbers">
          {block.data.items.map((it, i) => (
            <span key={i}>
              <b>{it.value}</b>
              <small>{it.label}</small>
            </span>
          ))}
        </div>
      );
    case "notes":
      return <div className="thumb-note">{block.data.body}</div>;
    case "rule":
    case "divider":
      return <div className="thumb-rule" />;
    case "cover":
      return (
        <div className="thumb-line">
          <b>Cover</b>
          <span className="thumb-cover-title">{block.data.title.replace(/\n/g, " ")}</span>
        </div>
      );
    default:
      return <div className="thumb-line">Block</div>;
  }
}

/* ------------------------------------------------------------------ */
/* block inspector (edit fields)                                      */
/* ------------------------------------------------------------------ */

function BlockEditor({ block, pageId, onClose }: { block: Block; pageId: string; onClose: () => void }) {
  const { updateBlock } = useStore();
  const set = (patch: Record<string, unknown>) => updateBlock(pageId, block.id, { data: patch });

  return (
    <div className="inspector">
      <div className="inspector-head">
        <span className="inspector-type font-mono">
          {blockIcon[block.type]} {blockLabel[block.type]}
        </span>
        <button className="icon-btn" onClick={onClose} aria-label="Close inspector">
          <X size={14} />
        </button>
      </div>

      <div className="inspector-fields">
        {block.type === "text" && (
          <>
            <label className="field">
              <span>Text</span>
              <textarea rows={4} value={block.data.body} onChange={(e) => set({ body: e.target.value })} spellCheck={false} />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Size</span>
                <input type="number" min={10} max={32} value={block.data.size ?? 15} onChange={(e) => set({ size: +e.target.value })} />
              </label>
              <label className="field">
                <span>Line height</span>
                <input type="number" min={1} max={2.4} step={0.05} value={block.data.lineHeight ?? 1.55} onChange={(e) => set({ lineHeight: +e.target.value })} />
              </label>
            </div>
          </>
        )}

        {block.type === "heading" && (
          <>
            <label className="field">
              <span>Title</span>
              <textarea rows={2} value={block.data.title} onChange={(e) => set({ title: e.target.value })} />
            </label>
            <label className="field">
              <span>Subtitle <i>optional</i></span>
              <input value={block.data.sub ?? ""} onChange={(e) => set({ sub: e.target.value })} />
            </label>
          </>
        )}

        {block.type === "cover" && (
          <>
            <label className="field">
              <span>Title</span>
              <textarea rows={2} value={block.data.title} onChange={(e) => set({ title: e.target.value })} />
            </label>
            <label className="field">
              <span>Subtitle</span>
              <input value={block.data.subtitle ?? ""} onChange={(e) => set({ subtitle: e.target.value })} />
            </label>
            <label className="field">
              <span>Edition</span>
              <input value={block.data.edition ?? ""} onChange={(e) => set({ edition: e.target.value })} />
            </label>
          </>
        )}

        {block.type === "kicker" && (
          <label className="field">
            <span>Label</span>
            <input value={block.data.label} onChange={(e) => set({ label: e.target.value })} />
          </label>
        )}

        {block.type === "quote" && (
          <>
            <label className="field">
              <span>Quote</span>
              <textarea rows={3} value={block.data.text} onChange={(e) => set({ text: e.target.value })} />
            </label>
            <label className="field">
              <span>Attribution</span>
              <input value={block.data.attribution ?? ""} onChange={(e) => set({ attribution: e.target.value })} />
            </label>
          </>
        )}

        {block.type === "image" && (
          <MediaFields
            src={block.data.src}
            caption={block.data.caption ?? ""}
            showFit
            fit={block.data.fit}
            onChange={(patch) => set(patch)}
          />
        )}

        {block.type === "video" && (
          <MediaFields
            src={block.data.src}
            caption={block.data.caption ?? ""}
            showFit
            fit={block.data.fit}
            showPoster
            poster={block.data.cover ?? ""}
            onChange={(patch) => set(patch)}
          />
        )}

        {block.type === "chart" && (
          <>
            <label className="field">
              <span>Chart type</span>
              <select value={block.data.kind} onChange={(e) => set({ kind: e.target.value })}>
                <option value="line">Line</option>
                <option value="bar">Bar</option>
              </select>
            </label>
            <label className="field">
              <span>Caption</span>
              <input value={block.data.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
            </label>
          </>
        )}

        {block.type === "numbers" && (
          <div className="field">
            <span>Stats — one per line as <code>value,label</code></span>
            <textarea
              rows={3}
              value={block.data.items.map((it) => `${it.value},${it.label}`).join("\n")}
              onChange={(e) =>
                set({
                  items: e.target.value.split("\n").map((line) => {
                    const [value, label] = line.split(",");
                    return { value: (value ?? "").trim(), label: (label ?? "").trim() };
                  }),
                })
              }
            />
          </div>
        )}

        {block.type === "notes" && (
          <label className="field">
            <span>Note</span>
            <textarea rows={2} value={block.data.body} onChange={(e) => set({ body: e.target.value })} />
          </label>
        )}

        {block.type === "divider" && (
          <label className="field">
            <span>Label <i>optional</i></span>
            <input value={block.data.label ?? ""} onChange={(e) => set({ label: e.target.value })} />
          </label>
        )}
      </div>
    </div>
  );
}

function MediaFields({
  src,
  caption,
  fit,
  showFit = false,
  showPoster = false,
  poster = "",
  onChange,
}: {
  src: string;
  caption: string;
  fit?: string;
  showFit?: boolean;
  showPoster?: boolean;
  poster?: string;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <>
      <label className="field">
        <span>Source URL</span>
        <div className="input-with-btn">
          <input value={src} onChange={(e) => onChange({ src: e.target.value })} placeholder="https://…" />
          <button className="mini-btn" onClick={() => setShowPicker((v) => !v)} aria-label="Browse stock">
            <ImageIcon size={14} />
          </button>
        </div>
      </label>
      {showPicker && <StockPicker onPick={(url) => { onChange({ src: url }); setShowPicker(false); }} />}
      {showPoster && (
        <label className="field">
          <span>Poster image</span>
          <input value={poster} onChange={(e) => onChange({ cover: e.target.value })} />
        </label>
      )}
      <label className="field">
        <span>Caption</span>
        <input value={caption} onChange={(e) => onChange({ caption: e.target.value })} />
      </label>
      {showFit && (
        <label className="field">
          <span>Fit</span>
          <select value={fit} onChange={(e) => onChange({ fit: e.target.value })}>
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="natural">Natural</option>
          </select>
        </label>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* page composer / content mapper                                     */
/* ------------------------------------------------------------------ */

function PageComposer({ page }: { page: BookPage }) {
  const { addBlock, removeBlock, moveBlock, duplicateBlock } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const blocks = useMemo(() => page.blocks.slice().sort((a, b) => a.order - b.order), [page.blocks]);

  return (
    <div className="composer">
      {blocks.map((blk, i) => (
        <div key={blk.id} className={`mapper-row ${activeId === blk.id ? "mapper-row-active" : ""}`}>
          <span className="mapper-grip" aria-hidden>
            <GripVertical size={13} />
          </span>
          <button className="mapper-thumb" onClick={() => setActiveId(activeId === blk.id ? null : blk.id)}>
            <BlockThumb block={blk} />
          </button>
          <span className="mapper-label font-mono">{blockLabel[blk.type]}</span>
          <div className="mapper-actions">
            <button className="icon-btn" disabled={i === 0} onClick={() => moveBlock(page.id, blk.id, -1)} aria-label="Move up">
              <ArrowUp size={13} />
            </button>
            <button className="icon-btn" disabled={i === blocks.length - 1} onClick={() => moveBlock(page.id, blk.id, 1)} aria-label="Move down">
              <ArrowDown size={13} />
            </button>
            <button className="icon-btn" onClick={() => duplicateBlock(page.id, blk.id)} aria-label="Duplicate">
              <Copy size={13} />
            </button>
            <button className="icon-btn icon-btn-danger" onClick={() => removeBlock(page.id, blk.id)} aria-label="Delete">
              <Trash2 size={13} />
            </button>
          </div>
          {activeId === blk.id && <BlockEditor block={blk} pageId={page.id} onClose={() => setActiveId(null)} />}
        </div>
      ))}

      {blocks.length === 0 && <p className="composer-empty font-serif">No content yet — add a block to begin.</p>}

      <div className="palette">
        <p className="palette-title font-mono">Add content</p>
        <div className="palette-grid">
          {templates.map((t) => (
            <button
              key={t.type}
              className={`palette-item ${t.rich ? "palette-item-rich" : ""}`}
              onClick={() => setActiveId(addBlock(page.id, t.type))}
              title={t.hint}
            >
              <span className="palette-icon">{blockIcon[t.type]}</span>
              <span className="font-mono">{t.label}</span>
              {t.rich && <i className="palette-dot" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* page background & tone editor                                      */
/* ------------------------------------------------------------------ */

function PageBackgroundEditor({
  page,
  totalPages,
  onUpdate,
  onApplyToAll,
}: {
  page: BookPage;
  totalPages: number;
  onUpdate: (patch: Partial<BookPage>) => void;
  onApplyToAll: (bgConfig: {
    bgPreset?: PageBgPreset;
    customBgColor?: string;
    bgImage?: string;
    bgImageOpacity?: number;
    bgImageFit?: BookPage["bgImageFit"];
    bgBlendMode?: BookPage["bgBlendMode"];
  }) => void;
}) {
  const [showStock, setShowStock] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);

  const activePreset = page.bgPreset || (page.tone === "dark" ? "dark" : "cream");

  const handlePreset = (presetId: PageBgPreset) => {
    const isDark = presetId === "dark" || presetId === "midnight";
    onUpdate({
      bgPreset: presetId,
      customBgColor: undefined,
      tone:
        page.tone === "cover" || page.tone === "closing"
          ? page.tone
          : isDark
          ? "dark"
          : "paper",
    });
  };

  const handleCustomColor = (hex: string) => {
    onUpdate({
      customBgColor: hex,
      bgPreset: undefined,
    });
  };

  const handleTextureSelect = (url: string, defaultOpacity: number) => {
    onUpdate({
      bgImage: url,
      bgImageOpacity: page.bgImageOpacity ?? defaultOpacity,
      bgImageFit: page.bgImageFit ?? "cover",
      bgBlendMode: page.bgBlendMode ?? "multiply",
    });
  };

  const handleApplyAll = () => {
    onApplyToAll({
      bgPreset: page.bgPreset,
      customBgColor: page.customBgColor,
      bgImage: page.bgImage,
      bgImageOpacity: page.bgImageOpacity,
      bgImageFit: page.bgImageFit,
      bgBlendMode: page.bgBlendMode,
    });
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2400);
  };

  return (
    <div className="bg-editor-box">
      <div className="bg-section-title font-mono flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-amber-200/80">
          <Paintbrush size={12} /> Background &amp; Tone
        </span>
        {page.bgImage && (
          <button
            type="button"
            className="text-[0.6rem] text-rose-400/90 hover:text-rose-300 flex items-center gap-1 font-mono cursor-pointer"
            onClick={() => onUpdate({ bgImage: undefined })}
          >
            <Trash2 size={10} /> Clear image
          </button>
        )}
      </div>

      {/* Preset Swatches */}
      <div className="bg-presets-area">
        <span className="bg-sub-label font-mono">Color Presets</span>
        <div className="bg-preset-grid">
          {PAGE_PRESETS.map((preset) => {
            const isSelected = !page.customBgColor && activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`bg-preset-chip ${isSelected ? "bg-preset-chip-active" : ""}`}
                onClick={() => handlePreset(preset.id)}
                title={`${preset.label} (${preset.dark ? "Dark" : "Light"})`}
              >
                <span className="preset-swatch-circle" style={{ background: preset.swatch }}>
                  {isSelected && <Check size={10} className="preset-check-icon" />}
                </span>
                <span className="preset-chip-name font-mono">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Input */}
      <div className="bg-custom-color-row">
        <span className="bg-sub-label font-mono">Custom Color</span>
        <div className="custom-color-inputs">
          <label className="color-picker-label">
            <input
              type="color"
              value={page.customBgColor || "#f7f1e3"}
              onChange={(e) => handleCustomColor(e.target.value)}
              className="color-picker-native"
            />
            <span
              className="color-picker-swatch"
              style={{ backgroundColor: page.customBgColor || "#f7f1e3" }}
            />
          </label>
          <input
            type="text"
            placeholder="#f7f1e3"
            value={page.customBgColor || ""}
            onChange={(e) => handleCustomColor(e.target.value)}
            className="custom-color-text font-mono"
          />
          {page.customBgColor && (
            <button
              type="button"
              className="reset-custom-color-btn"
              onClick={() => onUpdate({ customBgColor: undefined })}
              title="Reset to preset"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Textures / Background Images */}
      <div className="bg-texture-area">
        <span className="bg-sub-label font-mono flex items-center gap-1.5">
          <Sparkles size={11} className="text-amber-300/80" /> Textures &amp; Imagery
        </span>

        <div className="texture-swatch-grid">
          {BG_TEXTURES.map((tex) => {
            const isSelected = page.bgImage === tex.url;
            return (
              <button
                key={tex.id}
                type="button"
                className={`texture-chip ${isSelected ? "texture-chip-active" : ""}`}
                onClick={() => handleTextureSelect(tex.url, tex.defaultOpacity)}
                title={tex.label}
              >
                <img src={tex.url} alt={tex.label} className="texture-chip-img" loading="lazy" />
                <span className="texture-chip-name font-mono">{tex.label}</span>
                {isSelected && (
                  <span className="texture-chip-check">
                    <Check size={9} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom image URL + stock photo picker */}
        <div className="custom-img-url-box mt-2">
          <div className="input-with-btn">
            <input
              type="text"
              placeholder="Paste background image URL..."
              value={page.bgImage || ""}
              onChange={(e) => onUpdate({ bgImage: e.target.value || undefined })}
              className="bg-img-input"
            />
            <button
              type="button"
              className="mini-btn"
              onClick={() => setShowStock((v) => !v)}
              title="Browse Stock Photos"
            >
              <ImageIcon size={14} />
            </button>
          </div>

          {showStock && (
            <StockPicker
              onPick={(url) => {
                handleTextureSelect(url, 45);
                setShowStock(false);
              }}
            />
          )}

          {/* Background image adjustment controls if image is set */}
          {page.bgImage && (
            <div className="bg-img-sliders">
              <div className="slider-row">
                <span className="slider-label font-mono">
                  Opacity: <b>{page.bgImageOpacity ?? 40}%</b>
                </span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={page.bgImageOpacity ?? 40}
                  onChange={(e) => onUpdate({ bgImageOpacity: Number(e.target.value) })}
                  className="bg-range-slider"
                />
              </div>

              <div className="field-row mt-1.5">
                <label className="field">
                  <span>Image Fit</span>
                  <select
                    value={page.bgImageFit ?? "cover"}
                    onChange={(e) =>
                      onUpdate({ bgImageFit: e.target.value as BookPage["bgImageFit"] })
                    }
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="tile">Tile Pattern</option>
                  </select>
                </label>

                <label className="field">
                  <span>Blend Mode</span>
                  <select
                    value={page.bgBlendMode ?? "multiply"}
                    onChange={(e) =>
                      onUpdate({ bgBlendMode: e.target.value as BookPage["bgBlendMode"] })
                    }
                  >
                    <option value="multiply">Multiply</option>
                    <option value="overlay">Overlay</option>
                    <option value="soft-light">Soft Light</option>
                    <option value="normal">Normal</option>
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action: apply to all pages */}
      <div className="bg-apply-all-box">
        <button
          type="button"
          className="btn-apply-all font-mono"
          onClick={handleApplyAll}
          title="Apply this background theme across all pages in the book"
        >
          <Layers size={12} /> Apply to all {totalPages} pages
        </button>
        {appliedToast && (
          <span className="applied-toast-text font-mono text-[0.62rem] text-emerald-400 flex items-center gap-1">
            <Check size={11} /> Updated all pages!
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* editor shell                                                       */
/* ------------------------------------------------------------------ */

export default function Editor({
  open,
  onClose,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { session, addPage, removePage, movePage, updatePageMeta, applyBgToAll, updateTitle, setFlipAxis, setFlipSpeed, reset } = useStore();
  const flipAxis = session.flipAxis ?? "horizontal";
  const flipSpeed = session.flipSpeed ?? DEFAULT_FLIP_SPEED;

  const selected = selectedId ? session.pages.find((p) => p.id === selectedId) : null;

  return (
    <>
      <div className={`editor-backdrop ${open ? "editor-backdrop-shown" : ""}`} onClick={onClose} aria-hidden />
      <section className={`editor ${open ? "editor-open" : ""}`}>
        <div className="editor-head">
          <div>
            <p className="editor-kicker font-mono">Content mapper</p>
            <h2 className="editor-title font-display">Editor</h2>
          </div>
          <button className="icon-btn icon-btn-lg" onClick={onClose} aria-label="Close editor">
            <X size={18} />
          </button>
        </div>

        <div className="editor-scroll">
          <details className="editor-section" open>
            <summary>
              <span className="font-mono">Book settings</span>
              <ChevronDown size={14} />
            </summary>
            <div className="editor-section-body">
              <label className="field">
                <span>Book title</span>
                <input value={session.title} onChange={(e) => updateTitle(e.target.value)} />
              </label>

              <div className="field">
                <span>Flip speed</span>
                <div className="flip-speed-grid">
                  {(Object.keys(FLIP_SPEEDS) as FlipSpeed[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`flip-speed-btn ${flipSpeed === key ? "flip-speed-btn-active" : ""}`}
                      onClick={() => setFlipSpeed(key)}
                      title={FLIP_SPEEDS[key].hint}
                    >
                      <span className="font-mono">{FLIP_SPEEDS[key].label}</span>
                      <small className="font-mono">{(FLIP_SPEEDS[key].ms / 1000).toFixed(2)}s</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span>Page flip direction</span>
                <div className="flip-axis-toggle">
                  <button
                    type="button"
                    className={`flip-axis-btn ${flipAxis === "horizontal" ? "flip-axis-btn-active" : ""}`}
                    onClick={() => setFlipAxis("horizontal")}
                    title="Turn pages sideways (left / right)"
                  >
                    <MoveHorizontal size={15} />
                    <span className="font-mono">Horizontal</span>
                  </button>
                  <button
                    type="button"
                    className={`flip-axis-btn ${flipAxis === "vertical" ? "flip-axis-btn-active" : ""}`}
                    onClick={() => setFlipAxis("vertical")}
                    title="Turn pages up / down like a notepad"
                  >
                    <MoveVertical size={15} />
                    <span className="font-mono">Vertical</span>
                  </button>
                </div>
              </div>

              <button
                className="editor-reset"
                onClick={() => {
                  if (confirm("Reset the whole book to its seed content?")) reset();
                }}
              >
                Reset to seed content
              </button>
            </div>
          </details>

          <div className="editor-section">
            <div className="editor-section-title">
              <span className="font-mono">Pages</span>
              <button
                className="icon-btn"
                onClick={() => onSelect(addPage())}
                aria-label="Add page"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="page-list">
              {session.pages.map((p, i) => (
                <div key={p.id} className={`page-item ${selectedId === p.id ? "page-item-active" : ""}`}>
                  <button className="page-pick" onClick={() => onSelect(p.id)}>
                    <span className="page-num font-mono">{String(i + 1).padStart(2, "0")}</span>
                    <span className="page-meta">
                      <b className="font-display">{p.title}</b>
                      <small className="font-mono">
                        {p.label} · {p.blocks.length} blocks
                      </small>
                    </span>
                  </button>
                  
                  {/* Select as index checkbox on the right side space */}
                  <div className="page-index-toggle-wrapper">
                    <label className="page-index-label cursor-pointer" title="Mark this page as the Table of Contents Index page">
                      <input
                        type="checkbox"
                        checked={!!p.isIndexPage}
                        onChange={(e) => updatePageMeta(p.id, { isIndexPage: e.target.checked })}
                        className="page-index-checkbox"
                      />
                      <span className="page-index-tick-box">
                        {p.isIndexPage && <Check size={9} strokeWidth={3.5} />}
                      </span>
                      <span className="page-index-label-text font-mono">TOC</span>
                    </label>
                  </div>

                  <div className="mapper-actions">
                    <button className="icon-btn" disabled={i === 0} onClick={() => movePage(p.id, -1)} aria-label="Move page up">
                      <ArrowUp size={12} />
                    </button>
                    <button className="icon-btn" disabled={i === session.pages.length - 1} onClick={() => movePage(p.id, 1)} aria-label="Move page down">
                      <ArrowDown size={12} />
                    </button>
                    <button className="icon-btn icon-btn-danger" disabled={session.pages.length <= 1} onClick={() => removePage(p.id)} aria-label="Delete page">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selected && (
            <div className="editor-section">
              <div className="editor-section-title">
                <span className="font-mono">Content mapper — {selected.label}</span>
              </div>
              <div className="editor-section-body">
                <div className="field-row">
                  <label className="field">
                    <span>Page title</span>
                    <input value={selected.title} onChange={(e) => updatePageMeta(selected.id, { title: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Label</span>
                    <input value={selected.label} onChange={(e) => updatePageMeta(selected.id, { label: e.target.value })} />
                  </label>
                </div>
                <PageBackgroundEditor
                  page={selected}
                  totalPages={session.pages.length}
                  onUpdate={(patch) => updatePageMeta(selected.id, patch)}
                  onApplyToAll={applyBgToAll}
                />
                <PageComposer page={selected} />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
