/* ------------------------------------------------------------------ */
/*                               types                                */
/* ------------------------------------------------------------------ */

export type CoreBlockType =
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

/** Elementor-style extended elements — data is loosely shaped per element. */
export type GenericBlockType =
  // Layout
  | "flexContainer"
  | "innerSection"
  // Basic
  | "button"
  | "spacer"
  | "gmap"
  | "youtube"
  | "icon"
  // General
  | "imageBox"
  | "iconBox"
  | "imageCarousel"
  | "gallery"
  | "iconList"
  | "counter"
  | "testimonial"
  | "tabs"
  | "accordion"
  | "toggle"
  | "socialIcons"
  | "sidebar"
  | "textPath"
  | "form"
  | "cta"
  | "flipBox"
  | "priceList"
  | "priceTable"
  | "shareButtons"
  | "animatedHeadline"
  | "mediaCarousel"
  | "testimonialCarousel"
  | "reviews"
  | "facebook"
  | "lottie"
  | "countdown"
  | "iframe";

export type BlockType = CoreBlockType | GenericBlockType;

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

/** All extended elements share a loose data bag. */
export type GenericData = Record<string, unknown>;
export type GenericBlock = BlockBase<GenericBlockType, GenericData>;

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
  | DividerBlock
  | GenericBlock;

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
  // Layout
  flexContainer: "Flexbox Container",
  innerSection: "Inner Section",
  // Basic
  button: "Button",
  spacer: "Spacer",
  gmap: "Google Maps",
  youtube: "YouTube",
  icon: "Icon",
  // General
  imageBox: "Image Box",
  iconBox: "Icon Box",
  imageCarousel: "Image Carousel",
  gallery: "Basic Gallery",
  iconList: "Icon List",
  counter: "Counter",
  testimonial: "Testimonial",
  tabs: "Tabs",
  accordion: "Accordion",
  toggle: "Toggle",
  socialIcons: "Social Icons",
  sidebar: "Sidebar",
  textPath: "Text Path",
  form: "Form",
  cta: "Call to Action",
  flipBox: "Flip Box",
  priceList: "Price List",
  priceTable: "Price Table",
  shareButtons: "Share Buttons",
  animatedHeadline: "Animated Headline",
  mediaCarousel: "Media Carousel",
  testimonialCarousel: "Testimonial Carousel",
  reviews: "Reviews",
  facebook: "Facebook Page",
  lottie: "Lottie Animation",
  countdown: "Countdown Timer",
  iframe: "Web iFrame",
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
  flexContainer: "▤",
  innerSection: "⬓",
  button: "◉",
  spacer: "↕",
  gmap: "📍",
  youtube: "►",
  icon: "★",
  imageBox: "🖼",
  iconBox: "◈",
  imageCarousel: "❰❱",
  gallery: "▦",
  iconList: "☰",
  counter: "#",
  testimonial: "❝",
  tabs: "⊟",
  accordion: "≡",
  toggle: "⊕",
  socialIcons: "@",
  sidebar: "▥",
  textPath: "∿",
  form: "✉",
  cta: "❗",
  flipBox: "⇄",
  priceList: "$",
  priceTable: "▤$",
  shareButtons: "⤴",
  animatedHeadline: "✦",
  mediaCarousel: "▷▷",
  testimonialCarousel: "❝▷",
  reviews: "★★",
  facebook: "f",
  lottie: "◐",
  countdown: "⏱",
  iframe: "❒",
};

export type BlockCategory = "Layout" | "Basic" | "General" | "Editorial";

export type BlockTemplate = {
  type: BlockType;
  label: string;
  hint: string;
  rich: boolean;
  category: BlockCategory;
};

export const templates: BlockTemplate[] = [
  /* Layout Elements */
  { type: "flexContainer", label: "Flex Container", hint: "Flexbox layout container", rich: false, category: "Layout" },
  { type: "innerSection", label: "Inner Section", hint: "Legacy column section", rich: false, category: "Layout" },

  /* Basic Elements */
  { type: "heading", label: "Heading", hint: "Large title + optional subtitle", rich: false, category: "Basic" },
  { type: "image", label: "Image", hint: "Photo / artwork", rich: true, category: "Basic" },
  { type: "text", label: "Text Editor", hint: "Body copy", rich: true, category: "Basic" },
  { type: "video", label: "Video", hint: "Embed or file", rich: true, category: "Basic" },
  { type: "button", label: "Button", hint: "Call-to-action button", rich: false, category: "Basic" },
  { type: "divider", label: "Divider", hint: "Section break", rich: false, category: "Basic" },
  { type: "spacer", label: "Spacer", hint: "Adjustable vertical gap", rich: false, category: "Basic" },
  { type: "gmap", label: "Google Maps", hint: "Embedded map", rich: false, category: "Basic" },
  { type: "youtube", label: "YouTube", hint: "YouTube video embed", rich: false, category: "Basic" },
  { type: "icon", label: "Icon", hint: "Single glyph / icon", rich: false, category: "Basic" },

  /* General Elements */
  { type: "imageBox", label: "Image Box", hint: "Image + heading + text", rich: true, category: "General" },
  { type: "iconBox", label: "Icon Box", hint: "Icon + heading + text", rich: false, category: "General" },
  { type: "imageCarousel", label: "Image Carousel", hint: "Sliding image strip", rich: true, category: "General" },
  { type: "gallery", label: "Basic Gallery", hint: "Image grid", rich: true, category: "General" },
  { type: "iconList", label: "Icon List", hint: "Bulleted list with icons", rich: false, category: "General" },
  { type: "counter", label: "Counter", hint: "Animated number", rich: false, category: "General" },
  { type: "testimonial", label: "Testimonial", hint: "Quote + author", rich: false, category: "General" },
  { type: "tabs", label: "Tabs", hint: "Tabbed panels", rich: false, category: "General" },
  { type: "accordion", label: "Accordion", hint: "Collapsible panels", rich: false, category: "General" },
  { type: "toggle", label: "Toggle", hint: "Single collapsible", rich: false, category: "General" },
  { type: "socialIcons", label: "Social Icons", hint: "Row of social links", rich: false, category: "General" },
  { type: "sidebar", label: "Sidebar", hint: "Widget sidebar", rich: false, category: "General" },
  { type: "textPath", label: "Text Path", hint: "Text along a curve", rich: false, category: "General" },
  { type: "form", label: "Form", hint: "Contact / subscribe form", rich: false, category: "General" },
  { type: "cta", label: "Call to Action", hint: "Banner with button", rich: true, category: "General" },
  { type: "flipBox", label: "Flip Box", hint: "Hover-flip card", rich: false, category: "General" },
  { type: "priceList", label: "Price List", hint: "Menu-style price list", rich: false, category: "General" },
  { type: "priceTable", label: "Price Table", hint: "Pricing plan card", rich: false, category: "General" },
  { type: "shareButtons", label: "Share Buttons", hint: "Share to networks", rich: false, category: "General" },
  { type: "animatedHeadline", label: "Animated Headline", hint: "Rotating highlight words", rich: false, category: "General" },
  { type: "mediaCarousel", label: "Media Carousel", hint: "Mixed media slider", rich: true, category: "General" },
  { type: "testimonialCarousel", label: "Testimonial Carousel", hint: "Sliding testimonials", rich: false, category: "General" },
  { type: "reviews", label: "Reviews", hint: "Star reviews slider", rich: false, category: "General" },
  { type: "facebook", label: "Facebook Page", hint: "FB page / comments", rich: false, category: "General" },
  { type: "lottie", label: "Lottie Animation", hint: "Animated vector loop", rich: false, category: "General" },
  { type: "countdown", label: "Countdown Timer", hint: "Counts to a date", rich: false, category: "General" },
  { type: "iframe", label: "Web iFrame", hint: "Embed any URL", rich: false, category: "General" },

  /* Editorial (original) */
  { type: "cover", label: "Cover", hint: "Title page block", rich: false, category: "Editorial" },
  { type: "kicker", label: "Kicker", hint: "Small uppercase label", rich: false, category: "Editorial" },
  { type: "quote", label: "Quote", hint: "Pull quote with attribution", rich: false, category: "Editorial" },
  { type: "chart", label: "Chart", hint: "Line or bar chart", rich: false, category: "Editorial" },
  { type: "numbers", label: "Stats", hint: "Row of key figures", rich: false, category: "Editorial" },
  { type: "notes", label: "Note", hint: "Margin / field note", rich: false, category: "Editorial" },
  { type: "rule", label: "Rule", hint: "Foil divider line", rich: false, category: "Editorial" },
];

export const templateCategories: BlockCategory[] = ["Layout", "Basic", "General", "Editorial"];

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
    default:
      return { ...base, data: genericDefaults(type as GenericBlockType) } as GenericBlock;
  }
}

const SAMPLE_IMG = (seed: string) =>
  `https://picsum.photos/seed/${seed}/640/400`;

function genericDefaults(type: GenericBlockType): GenericData {
  switch (type) {
    case "flexContainer":
      return { direction: "row", gap: 12, align: "stretch", justify: "flex-start", items: ["Column one", "Column two"] };
    case "innerSection":
      return { columns: 2, items: ["Section A", "Section B"] };
    case "button":
      return { text: "Get started", href: "#", style: "solid", align: "left" };
    case "spacer":
      return { height: 32 };
    case "gmap":
      return { query: "New York, NY", zoom: 12 };
    case "youtube":
      return { videoId: "dQw4w9WgXcQ", caption: "" };
    case "icon":
      return { glyph: "★", size: 40, label: "" };
    case "imageBox":
      return { src: SAMPLE_IMG("box"), title: "Image Box", body: "Short supporting copy sits beneath the image.", align: "center" };
    case "iconBox":
      return { glyph: "◈", title: "Icon Box", body: "Explain a feature with an icon, a title and a line of copy." };
    case "imageCarousel":
      return { images: [SAMPLE_IMG("c1"), SAMPLE_IMG("c2"), SAMPLE_IMG("c3")], caption: "" };
    case "gallery":
      return { images: [SAMPLE_IMG("g1"), SAMPLE_IMG("g2"), SAMPLE_IMG("g3"), SAMPLE_IMG("g4")], columns: 2 };
    case "iconList":
      return { items: ["First point", "Second point", "Third point"], glyph: "✓" };
    case "counter":
      return { start: 0, end: 1250, prefix: "", suffix: "+", title: "Happy readers" };
    case "testimonial":
      return { quote: "This playbook changed how our team ships.", author: "Alex Rivera", role: "Head of Product", avatar: SAMPLE_IMG("av") };
    case "tabs":
      return { tabs: [ { title: "Tab one", body: "Content for the first tab." }, { title: "Tab two", body: "Content for the second tab." } ] };
    case "accordion":
      return { items: [ { title: "What is this?", body: "An expandable answer." }, { title: "How does it work?", body: "Click a row to expand." } ] };
    case "toggle":
      return { title: "Read more", body: "Hidden content revealed on toggle.", open: false };
    case "socialIcons":
      return { networks: ["Twitter", "LinkedIn", "Instagram", "GitHub"] };
    case "sidebar":
      return { title: "Widgets", items: ["Recent posts", "Categories", "Tags"] };
    case "textPath":
      return { text: "Words that follow a gentle curve", curve: "wave" };
    case "form":
      return { title: "Get in touch", fields: ["Name", "Email", "Message"], submit: "Send" };
    case "cta":
      return { title: "Ready to begin?", body: "Start your next launch with confidence.", button: "Start now", src: SAMPLE_IMG("cta") };
    case "flipBox":
      return { frontTitle: "Hover me", backTitle: "Surprise!", backBody: "The card flips to reveal more.", front: SAMPLE_IMG("flip") };
    case "priceList":
      return { items: [ { name: "Espresso", desc: "Rich & bold", price: "$3" }, { name: "Cappuccino", desc: "Silky foam", price: "$4.5" } ] };
    case "priceTable":
      return { plan: "Pro", price: "$29", period: "/mo", features: ["Everything in Basic", "Priority support", "Unlimited pages"], button: "Choose Pro", featured: true };
    case "shareButtons":
      return { networks: ["Twitter", "Facebook", "LinkedIn", "Email"] };
    case "animatedHeadline":
      return { before: "We build", words: ["books", "stories", "experiences"], after: "that move." };
    case "mediaCarousel":
      return { images: [SAMPLE_IMG("m1"), SAMPLE_IMG("m2"), SAMPLE_IMG("m3")] };
    case "testimonialCarousel":
      return { items: [ { quote: "Absolutely brilliant.", author: "Sam Lee" }, { quote: "A joy to read.", author: "Dana Cole" } ] };
    case "reviews":
      return { items: [ { stars: 5, text: "Five stars, would flip again.", author: "Jordan" }, { stars: 4, text: "Really solid.", author: "Kim" } ] };
    case "facebook":
      return { page: "Meta", mode: "page" };
    case "lottie":
      return { preset: "pulse", caption: "" };
    case "countdown":
      return { target: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10), title: "Launching in" };
    case "iframe":
      return { url: "https://example.com", height: 220 };
    default:
      return {};
  }
}
