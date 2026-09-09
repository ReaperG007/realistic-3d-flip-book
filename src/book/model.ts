/* ------------------------------------------------------------------ */
/*                               types                                */
/* ------------------------------------------------------------------ */

export type BlockType =
  | "heading"
  | "text"
  | "kicker"
  | "rule"
  | "quote"
  | "image"
  | "video"
  | "chart"
  | "numbers"
  | "notes"
  | "cover"
  | "divider";

export type MediaFit = "cover" | "contain" | "natural";

/** Any block placed on a page. The `data` shape is discriminated by `type`. */
export type BlockBase<T extends BlockType, D> = {
  id: string;
  type: T;
  x: number; // % horizontally (1 = full width)
  order: number;
  data: D;
};

export type TextBlock = BlockBase<"text", { body: string; size?: number; lineHeight?: number }>;
export type HeadingBlock = BlockBase<"heading", { title: string; sub?: string }>;
export type KickerBlock = BlockBase<"kicker", { label: string }>;
export type RuleBlock = BlockBase<"rule", { bold?: boolean }>;
export type QuoteBlock = BlockBase<"quote", { text: string; attribution?: string }>;
export type ImageBlock = BlockBase<
  "image",
  { src: string; alt?: string; caption?: string; fit: MediaFit }
>;
export type VideoBlock = BlockBase<
  "video",
  { src: string; cover?: string; caption?: string; fit: MediaFit }
>;
export type ChartBlock = BlockBase<"chart", { kind: "line" | "bar"; title?: string }>;
export type NumbersBlock = BlockBase<
  "numbers",
  { items: { value: string; label: string }[] }
>;
export type NotesBlock = BlockBase<"notes", { body: string }>;
export type CoverBlock = BlockBase<
  "cover",
  { title: string; subtitle?: string; edition?: string }
>;
export type DividerBlock = BlockBase<"divider", { label?: string }>;

export type Block =
  | TextBlock
  | HeadingBlock
  | KickerBlock
  | RuleBlock
  | QuoteBlock
  | ImageBlock
  | VideoBlock
  | ChartBlock
  | NumbersBlock
  | NotesBlock
  | CoverBlock
  | DividerBlock;

export type PageTone = "cover" | "paper" | "dark" | "closing";

export type PageBgPreset =
  | "cream"
  | "sky"
  | "cyan"
  | "amber"
  | "emerald"
  | "rose"
  | "lavender"
  | "slate"
  | "dark"
  | "midnight";

export type PresetDef = {
  id: PageBgPreset;
  label: string;
  swatch: string;
  background: string;
  textColor: string;
  dark: boolean;
  kickerColor?: string;
};

export const PAGE_PRESETS: PresetDef[] = [
  {
    id: "cream",
    label: "Cream",
    swatch: "linear-gradient(135deg, #fdf8ec, #ece2c9)",
    background:
      "radial-gradient(120% 80% at 8% 12%, rgba(255, 255, 255, 0.7), transparent 52%), linear-gradient(104deg, #fdf8ec 0%, #f6efdd 52%, #ece2c9 100%)",
    textColor: "#1d1e19",
    dark: false,
    kickerColor: "#c0432c",
  },
  {
    id: "sky",
    label: "Sky",
    swatch: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
    background:
      "radial-gradient(110% 80% at 12% 10%, rgba(255, 255, 255, 0.9), transparent 55%), linear-gradient(115deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)",
    textColor: "#082f49",
    dark: false,
    kickerColor: "#0284c7",
  },
  {
    id: "cyan",
    label: "Cyan",
    swatch: "linear-gradient(135deg, #cffafe, #a5f3fc)",
    background:
      "radial-gradient(115% 85% at 10% 8%, rgba(255, 255, 255, 0.85), transparent 50%), linear-gradient(112deg, #ecfeff 0%, #cffafe 54%, #a5f3fc 100%)",
    textColor: "#164e63",
    dark: false,
    kickerColor: "#0891b2",
  },
  {
    id: "amber",
    label: "Amber",
    swatch: "linear-gradient(135deg, #fef3c7, #fde68a)",
    background:
      "radial-gradient(110% 80% at 12% 14%, rgba(255, 255, 255, 0.8), transparent 52%), linear-gradient(108deg, #fffbeb 0%, #fef3c7 48%, #fde68a 100%)",
    textColor: "#451a03",
    dark: false,
    kickerColor: "#b45309",
  },
  {
    id: "emerald",
    label: "Emerald",
    swatch: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    background:
      "radial-gradient(115% 85% at 15% 10%, rgba(255, 255, 255, 0.85), transparent 50%), linear-gradient(110deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)",
    textColor: "#064e3b",
    dark: false,
    kickerColor: "#059669",
  },
  {
    id: "rose",
    label: "Blush",
    swatch: "linear-gradient(135deg, #ffe4e6, #fecdd3)",
    background:
      "radial-gradient(110% 80% at 10% 12%, rgba(255, 255, 255, 0.85), transparent 52%), linear-gradient(112deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)",
    textColor: "#4c0519",
    dark: false,
    kickerColor: "#e11d48",
  },
  {
    id: "lavender",
    label: "Lavender",
    swatch: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
    background:
      "radial-gradient(110% 80% at 12% 10%, rgba(255, 255, 255, 0.85), transparent 50%), linear-gradient(112deg, #f5f3ff 0%, #ede9fe 52%, #ddd6fe 100%)",
    textColor: "#2e1065",
    dark: false,
    kickerColor: "#7c3aed",
  },
  {
    id: "slate",
    label: "Slate",
    swatch: "linear-gradient(135deg, #f1f5f9, #cbd5e1)",
    background:
      "radial-gradient(110% 80% at 10% 10%, rgba(255, 255, 255, 0.9), transparent 50%), linear-gradient(115deg, #f8fafc 0%, #f1f5f9 50%, #cbd5e1 100%)",
    textColor: "#0f172a",
    dark: false,
    kickerColor: "#475569",
  },
  {
    id: "dark",
    label: "Forest",
    swatch: "linear-gradient(135deg, #172822, #0c1714)",
    background:
      "radial-gradient(120% 90% at 90% 4%, rgba(231, 201, 138, 0.22), transparent 54%), linear-gradient(104deg, #172822 0%, #12201c 62%, #0c1714 100%)",
    textColor: "#f2e8d6",
    dark: true,
    kickerColor: "#e7c98a",
  },
  {
    id: "midnight",
    label: "Midnight",
    swatch: "linear-gradient(135deg, #18181b, #09090b)",
    background:
      "radial-gradient(100% 70% at 18% 6%, rgba(231, 201, 138, 0.18), transparent 58%), linear-gradient(158deg, #18181b 0%, #111113 55%, #050507 100%)",
    textColor: "#fafafa",
    dark: true,
    kickerColor: "#facc15",
  },
];

export type BgTextureDef = {
  id: string;
  label: string;
  url: string;
  defaultOpacity: number;
};

export const BG_TEXTURES: BgTextureDef[] = [
  {
    id: "parchment",
    label: "Parchment",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=70",
    defaultOpacity: 45,
  },
  {
    id: "sky-clouds",
    label: "Cloud Sky",
    url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=70",
    defaultOpacity: 40,
  },
  {
    id: "blueprint",
    label: "Cyan Grid",
    url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=70",
    defaultOpacity: 35,
  },
  {
    id: "rice-paper",
    label: "Rice Paper",
    url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=70",
    defaultOpacity: 50,
  },
  {
    id: "marble",
    label: "Marble Endpaper",
    url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=70",
    defaultOpacity: 35,
  },
  {
    id: "night-stars",
    label: "Deep Cosmos",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=70",
    defaultOpacity: 60,
  },
];

export type BookPage = {
  id: string;
  label: string;
  title: string;
  tone: PageTone;
  bgPreset?: PageBgPreset;
  customBgColor?: string;
  bgImage?: string;
  bgImageOpacity?: number;
  bgImageFit?: "cover" | "contain" | "tile";
  bgBlendMode?: "normal" | "multiply" | "overlay" | "soft-light";
  blocks: Block[];
  isIndexPage?: boolean;
};

export type FlipAxis = "horizontal" | "vertical";

export type FlipSpeed = "slow" | "cinematic" | "normal" | "fast";

/** how long one full page turn takes, in milliseconds */
export const FLIP_SPEEDS: Record<FlipSpeed, { ms: number; label: string; hint: string }> = {
  slow: { ms: 1900, label: "Slow", hint: "Very deliberate — every stage of the turn is visible" },
  cinematic: { ms: 1300, label: "Cinematic", hint: "Balanced, film-like page turn" },
  normal: { ms: 850, label: "Normal", hint: "Snappy, app-like pacing" },
  fast: { ms: 520, label: "Fast", hint: "Quick flick" },
};

export const DEFAULT_FLIP_SPEED: FlipSpeed = "slow";

export type Session = {
  title: string;
  edition: string;
  flipAxis?: FlipAxis;
  flipSpeed?: FlipSpeed;
  pages: BookPage[];
};

/* ------------------------------------------------------------------ */
/*                              helpers                               */
/* ------------------------------------------------------------------ */

export const uid = (p = "b") =>
  `${p}_${Math.random().toString(36).slice(2, 7)}${Date.now().toString(36).slice(-3)}`;

export const blockLabel: Record<BlockType, string> = {
  heading: "Heading",
  text: "Paragraph",
  kicker: "Kicker",
  rule: "Rule line",
  quote: "Pull quote",
  image: "Image",
  video: "Video",
  chart: "Chart",
  numbers: "Stat grid",
  notes: "Margin note",
  cover: "Cover",
  divider: "Divider",
};

export const blockIcon: Record<BlockType, string> = {
  heading: "H",
  text: "¶",
  kicker: "K",
  rule: "—",
  quote: "“",
  image: "◻",
  video: "▶",
  chart: "◔",
  numbers: "1·2",
  notes: "✎",
  cover: "▣",
  divider: "·",
};

export type BlockTemplate = {
  type: BlockType;
  label: string;
  hint: string;
  rich: boolean;
};

export const templates: BlockTemplate[] = [
  { type: "cover", label: "Cover", hint: "Title page block", rich: false },
  { type: "heading", label: "Heading", hint: "Large title + optional subtitle", rich: false },
  { type: "kicker", label: "Kicker", hint: "Small uppercase label", rich: false },
  { type: "text", label: "Text", hint: "Body copy, rich-formatted", rich: true },
  { type: "quote", label: "Quote", hint: "Pull quote with attribution", rich: false },
  { type: "image", label: "Image", hint: "Photo / artwork", rich: true },
  { type: "video", label: "Video", hint: "Embed or file", rich: true },
  { type: "chart", label: "Chart", hint: "Line or bar chart", rich: false },
  { type: "numbers", label: "Stats", hint: "Row of key figures", rich: false },
  { type: "notes", label: "Note", hint: "Margin / field note", rich: false },
  { type: "rule", label: "Rule", hint: "Foil divider line", rich: false },
  { type: "divider", label: "Divider", hint: "Section break", rich: false },
];

export const defaultImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='520'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#1f3a31'/><stop offset='1' stop-color='#0e1a16'/></linearGradient></defs><rect width='800' height='520' fill='url(#g)'/><text x='400' y='275' fill='#e7c98a' font-family='Georgia' font-size='34' font-style='italic' text-anchor='middle'>Rich media placeholder</text></svg>`,
  );

export function makeBlock(type: BlockType): Block {
  const base = { id: uid(), type, x: 1, order: 0 } as const;
  switch (type) {
    case "heading":
      return { ...base, data: { title: "New heading", sub: "" } } as HeadingBlock;
    case "text":
      return { ...base, data: { body: "Start writing…", size: 15 } } as TextBlock;
    case "kicker":
      return { ...base, data: { label: "Kicker" } } as KickerBlock;
    case "rule":
      return { ...base, data: { bold: false } } as RuleBlock;
    case "quote":
      return { ...base, data: { text: "A thought worth pulling out.", attribution: "" } } as QuoteBlock;
    case "image":
      return { ...base, data: { src: defaultImage, alt: "", caption: "", fit: "cover" } } as ImageBlock;
    case "video":
      return {
        ...base,
        data: { src: "https://www.w3schools.com/html/mov_bbb.mp4", caption: "", fit: "contain" },
      } as VideoBlock;
    case "chart":
      return { ...base, data: { kind: "line", title: "" } } as ChartBlock;
    case "numbers":
      return {
        ...base,
        data: { items: [
          { value: "8", label: "moves" },
          { value: "72%", label: "ready" },
          { value: "1", label: "owner" },
        ] },
      } as NumbersBlock;
    case "notes":
      return { ...base, data: { body: "Field note" } } as NotesBlock;
    case "cover":
      return { ...base, data: { title: "The\nPlaybook", subtitle: "Launch moves, calls and counters.", edition: "No. 04" } } as CoverBlock;
    case "divider":
      return { ...base, data: { label: "" } } as DividerBlock;
  }
}
