import { defaultImage, uid, type Block, type BookPage, type Session } from "./model";

const b = (
  type: Block["type"],
  data: Block["data"],
  x = 1,
): Block => ({ id: uid(), type, data, x, order: 0 } as Block);

const SAMPLE_IMG = (seed: string) => `https://picsum.photos/seed/${seed}/640/400`;

export function seedSession(): Session {
  const pages: BookPage[] = [
    // 0 — front cover
    {
      id: uid("page"),
      label: "Front cover",
      title: "The Playbook",
      tone: "cover",
      blocks: [
        b("cover", {
          title: "The\nPlaybook",
          subtitle: "Every element, one volume — the complete element showcase edition.",
          edition: "No. 05 · Elements",
        }),
      ],
    },
    // 1 — TOC
    {
      id: uid("page"),
      label: "Inside cover",
      title: "Forty-six elements, one read",
      tone: "dark",
      isIndexPage: true,
      blocks: [
        b("kicker", { label: "What's inside" }),
        b("heading", { title: "Forty-six elements,\none read", sub: "Every core and extended element, live" }),
        b("rule", { bold: true }),
        b("text", {
          body: "This edition is the full catalogue: editorial staples, layout containers, basic widgets and every Elementor-style extended element — all rendering inside the book and in the exported flip book.",
        }),
        b("notes", { body: "Colophon — set in Bricolage, Newsreader & Plex Mono. Flip, drag, present." }),
      ],
    },
    // 2 — Layout elements
    {
      id: uid("page"),
      label: "Layout",
      title: "Layout: flex & inner sections",
      tone: "paper",
      bgPreset: "cream",
      blocks: [
        b("kicker", { label: "Layout elements" }),
        b("heading", { title: "Layout", sub: "Containers & columns" }),
        b("rule", {}),
        b("flexContainer", {
          direction: "row",
          gap: 12,
          align: "stretch",
          justify: "flex-start",
          items: ["Flex cell one", "Flex cell two", "Flex cell three"],
        }),
        b("innerSection", { columns: 2, items: ["Inner section column A", "Inner section column B"] }),
        b("spacer", { height: 24 }),
        b("notes", { body: "Flexbox container, inner section columns and spacer — all fluid." }),
      ],
    },
    // 3 — Basic elements part 1
    {
      id: uid("page"),
      label: "Basic I",
      title: "Basic: buttons, icons, spacers",
      tone: "paper",
      blocks: [
        b("kicker", { label: "Basic elements" }),
        b("heading", { title: "Buttons & icons" }),
        b("rule", {}),
        b("button", { text: "Get started", href: "#", style: "solid", align: "left" }),
        b("button", { text: "Read the docs", href: "#", style: "outline", align: "left" }),
        b("button", { text: "Skip ahead", href: "#", style: "ghost", align: "left" }),
        b("icon", { glyph: "★", size: 44, label: "Starred" }),
        b("icon", { glyph: "❖", size: 30, label: "" }),
        b("notes", { body: "Solid, outline and ghost buttons plus single icons." }),
      ],
    },
    // 4 — Basic elements part 2 (media embeds)
    {
      id: uid("page"),
      label: "Basic II",
      title: "Basic: maps & video embeds",
      tone: "paper",
      bgPreset: "sky",
      blocks: [
        b("kicker", { label: "Embedded media" }),
        b("heading", { title: "Maps & video" }),
        b("rule", {}),
        b("gmap", { query: "Bhubaneswar, Odisha", zoom: 12 }),
        b("youtube", { videoId: "dQw4w9WgXcQ", caption: "Embedded YouTube — plays right inside the page." }),
        b("notes", { body: "Google Maps and YouTube embeds stay interactive in the book." }),
      ],
    },
    // 5 — imageBox / iconBox / iconList
    {
      id: uid("page"),
      label: "General I",
      title: "Boxes & lists",
      tone: "paper",
      bgPreset: "cyan",
      blocks: [
        b("kicker", { label: "General elements" }),
        b("heading", { title: "Boxes & lists" }),
        b("rule", {}),
        b("imageBox", {
          src: SAMPLE_IMG("box"),
          title: "Image Box",
          body: "Short supporting copy sits beneath the image.",
          align: "center",
        }),
        b("iconBox", { glyph: "◈", title: "Icon Box", body: "Explain a feature with an icon, a title and a line of copy." }),
        b("iconList", { items: ["First point of the pitch", "Second point — evidence", "Third point — the ask"], glyph: "✓" }),
        b("notes", { body: "Image box, icon box and checklisted icon list." }),
      ],
    },
    // 6 — carousels & gallery
    {
      id: uid("page"),
      label: "General II",
      title: "Carousels & gallery",
      tone: "paper",
      bgPreset: "emerald",
      blocks: [
        b("kicker", { label: "Sliders & grids" }),
        b("heading", { title: "Carousels & gallery" }),
        b("rule", {}),
        b("imageCarousel", { images: [SAMPLE_IMG("c1"), SAMPLE_IMG("c2"), SAMPLE_IMG("c3")], caption: "Image carousel — tap the arrows." }),
        b("gallery", { images: [SAMPLE_IMG("g1"), SAMPLE_IMG("g2"), SAMPLE_IMG("g3"), SAMPLE_IMG("g4")], columns: 2 }),
        b("mediaCarousel", { images: [SAMPLE_IMG("m1"), SAMPLE_IMG("m2")] }),
        b("notes", { body: "Image carousel, basic gallery grid and media carousel." }),
      ],
    },
    // 7 — counters / stats
    {
      id: uid("page"),
      label: "General III",
      title: "Counters & stats",
      tone: "dark",
      blocks: [
        b("kicker", { label: "Numbers that move" }),
        b("heading", { title: "Counters & stats" }),
        b("rule", { bold: true }),
        b("counter", { start: 0, end: 1250, prefix: "", suffix: "+", title: "Happy readers" }),
        b("numbers", {
          items: [
            { value: "46", label: "elements" },
            { value: "20", label: "pages" },
            { value: "1", label: "book" },
          ],
        }),
        b("notes", { body: "Animated counter (live in-app, static in export) + stat grid." }),
      ],
    },
    // 8 — testimonial / carousel / reviews
    {
      id: uid("page"),
      label: "General IV",
      title: "Testimonials & reviews",
      tone: "paper",
      bgPreset: "lavender",
      blocks: [
        b("kicker", { label: "Social proof" }),
        b("heading", { title: "Testimonials & reviews" }),
        b("rule", {}),
        b("testimonial", {
          quote: "This playbook changed how our team ships.",
          author: "Alex Rivera",
          role: "Head of Product",
          avatar: SAMPLE_IMG("av"),
        }),
        b("testimonialCarousel", {
          items: [
            { quote: "Absolutely brilliant.", author: "Sam Lee" },
            { quote: "A joy to read.", author: "Dana Cole" },
          ],
        }),
        b("reviews", {
          items: [
            { stars: 5, text: "Five stars, would flip again.", author: "Jordan" },
            { stars: 4, text: "Really solid.", author: "Kim" },
          ],
        }),
        b("notes", { body: "Testimonial, sliding testimonial carousel and star reviews." }),
      ],
    },
    // 9 — tabs / accordion / toggle
    {
      id: uid("page"),
      label: "General V",
      title: "Tabs, accordion, toggle",
      tone: "paper",
      bgPreset: "amber",
      blocks: [
        b("kicker", { label: "Collapsible content" }),
        b("heading", { title: "Tabs, accordion, toggle" }),
        b("rule", {}),
        b("tabs", {
          tabs: [
            { title: "Tab one", body: "Content for the first tab." },
            { title: "Tab two", body: "Content for the second tab." },
          ],
        }),
        b("accordion", {
          items: [
            { title: "What is this?", body: "An expandable answer." },
            { title: "How does it work?", body: "Click a row to expand." },
          ],
        }),
        b("toggle", { title: "Read more", body: "Hidden content revealed on toggle.", open: false }),
        b("notes", { body: "Tabs, accordion and a single toggle — all interactive in the reader." }),
      ],
    },
    // 10 — social / share / facebook
    {
      id: uid("page"),
      label: "General VI",
      title: "Social & sharing",
      tone: "paper",
      blocks: [
        b("kicker", { label: "Reach & share" }),
        b("heading", { title: "Social & sharing" }),
        b("rule", {}),
        b("socialIcons", { networks: ["Twitter", "LinkedIn", "Instagram", "GitHub"] }),
        b("shareButtons", { networks: ["Twitter", "Facebook", "LinkedIn", "Email"] }),
        b("facebook", { page: "The Playbook", mode: "page" }),
        b("notes", { body: "Social icon row, share buttons and a Facebook page widget." }),
      ],
    },
    // 11 — pricing
    {
      id: uid("page"),
      label: "General VII",
      title: "Pricing & menus",
      tone: "paper",
      bgPreset: "rose",
      blocks: [
        b("kicker", { label: "Price it out" }),
        b("heading", { title: "Pricing & menus" }),
        b("rule", {}),
        b("priceList", {
          items: [
            { name: "Espresso", desc: "Rich & bold", price: "$3" },
            { name: "Cappuccino", desc: "Silky foam", price: "$4.5" },
          ],
        }),
        b("priceTable", {
          plan: "Pro",
          price: "$29",
          period: "/mo",
          features: ["Everything in Basic", "Priority support", "Unlimited pages"],
          button: "Choose Pro",
          featured: true,
        }),
        b("notes", { body: "Menu-style price list and a featured pricing table." }),
      ],
    },
    // 12 — cta / flipbox / animated headline
    {
      id: uid("page"),
      label: "General VIII",
      title: "CTA, flip box, headline",
      tone: "dark",
      bgPreset: "midnight",
      blocks: [
        b("kicker", { label: "Motion & action" }),
        b("heading", { title: "CTA, flip box, headline" }),
        b("rule", { bold: true }),
        b("animatedHeadline", { before: "We build", words: ["books", "stories", "experiences"], after: "that move." }),
        b("cta", {
          title: "Ready to begin?",
          body: "Start your next launch with confidence.",
          button: "Start now",
          src: SAMPLE_IMG("cta"),
        }),
        b("flipBox", { frontTitle: "Hover me", backTitle: "Surprise!", backBody: "The card flips to reveal more.", front: SAMPLE_IMG("flip") }),
        b("notes", { body: "Animated headline, CTA banner and a hover flip box." }),
      ],
    },
    // 13 — form / sidebar / textPath
    {
      id: uid("page"),
      label: "General IX",
      title: "Forms & widgets",
      tone: "paper",
      blocks: [
        b("kicker", { label: "Inputs & extras" }),
        b("heading", { title: "Forms & widgets" }),
        b("rule", {}),
        b("form", { title: "Get in touch", fields: ["Name", "Email", "Message"], submit: "Send" }),
        b("sidebar", { title: "Widgets", items: ["Recent posts", "Categories", "Tags"] }),
        b("textPath", { text: "Words that follow a gentle curve", curve: "wave" }),
        b("notes", { body: "Contact form, widget sidebar and text on an SVG path." }),
      ],
    },
    // 14 — countdown / lottie / iframe
    {
      id: uid("page"),
      label: "General X",
      title: "Countdown, lottie, iframe",
      tone: "paper",
      bgPreset: "slate",
      blocks: [
        b("kicker", { label: "Timers & embeds" }),
        b("heading", { title: "Countdown, lottie, iframe" }),
        b("rule", {}),
        b("countdown", { target: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10), title: "Next edition in" }),
        b("lottie", { preset: "pulse", caption: "Animated orb (Lottie-style loop)" }),
        b("iframe", { url: "https://example.com", height: 200 }),
        b("notes", { body: "Countdown timer, lottie-style animation and a generic web iframe." }),
      ],
    },
    // 15 — editorial: chart + quote + divider
    {
      id: uid("page"),
      label: "Editorial I",
      title: "Momentum is a curve",
      tone: "paper",
      bgPreset: "cyan",
      blocks: [
        b("kicker", { label: "Editorial elements" }),
        b("heading", { title: "Momentum is a curve" }),
        b("chart", { kind: "line", title: "Activation vs repeats" }),
        b("text", {
          body: "Activation climbs when the second action is easier than the first. Watch the gap between the lines — that gap is your onboarding.",
        }),
        b("quote", { text: "Call it loud.", attribution: "Rule of the edition" }),
      ],
    },
    // 16 — editorial: bar chart + readiness
    {
      id: uid("page"),
      label: "Editorial II",
      title: "Readiness ledger",
      tone: "paper",
      blocks: [
        b("kicker", { label: "Score it honestly" }),
        b("heading", { title: "Readiness ledger" }),
        b("chart", { kind: "bar", title: "Ship readiness" }),
        b("text", {
          body: "Anything under seventy gets an owner and a date. Red is not a warning — it is a work item.",
        }),
        b("divider", { label: "Section break" }),
      ],
    },
    // 17 — editorial: video + image
    {
      id: uid("page"),
      label: "Editorial III",
      title: "Keep the tempo human",
      tone: "dark",
      blocks: [
        b("quote", { text: "Short instructions beat perfect theory while the team is still moving." }),
        b("rule", { bold: true }),
        b("text", {
          body: "Use sections as breaths: prepare, act, observe, adjust. Keep that cadence in the interface too — instant response while you drag, a slower settle when the page lands.",
        }),
        b("image", { src: defaultImage, caption: "Tempo — two beats per page", fit: "cover" }),
        b("video", { src: "https://www.w3schools.com/html/mov_bbb.mp4", caption: "Video block — plays inline", fit: "contain" }),
      ],
    },
    // 18 — editorial: field notes
    {
      id: uid("page"),
      label: "Editorial IV",
      title: "Write it in the margin",
      tone: "paper",
      bgPreset: "amber",
      blocks: [
        b("kicker", { label: "Revise where the work happens" }),
        b("heading", { title: "Write it in the margin" }),
        b("text", {
          body: "When a launch, pitch or incident ends, update the page that would have helped most. Keep the lesson close to the procedure.",
        }),
        b("notes", { body: "What changed, who acts next, what would make us re-read this page." }),
        b("rule", {}),
        b("kicker", { label: "End of the editorial tour" }),
      ],
    },
    // 19 — back cover
    {
      id: uid("page"),
      label: "Back cover",
      title: "Close the loop",
      tone: "closing",
      blocks: [
        b("kicker", { label: "End of edition 05" }),
        b("heading", { title: "Close the loop" }),
        b("text", {
          body: "Forty-six elements across twenty pages — every block rendered, every widget live. Everything else waits for the next edition.",
        }),
        b("rule", { bold: true }),
        b("notes", { body: "The complete catalogue." }),
      ],
    },
  ];

  pages.forEach((p) => {
    p.blocks.forEach((blk, i) => (blk.order = i));
  });

  return { title: "The Playbook", edition: "No. 05 · Elements", flipSpeed: "cinematic", flipAxis: "horizontal", pages };
}
