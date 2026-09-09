import { defaultImage, uid, type Block, type BookPage, type Session } from "./model";

const b = (
  type: Block["type"],
  data: Block["data"],
  x = 1,
): Block => ({ id: uid(), type, data, x, order: 0 } as Block);

export function seedSession(): Session {
  const pages: BookPage[] = [
    {
      id: uid("page"),
      label: "Front cover",
      title: "The Playbook",
      tone: "cover",
      blocks: [
        b("cover", {
          title: "The\nPlaybook",
          subtitle: "Launch moves, calls and counters for teams shipping under a live clock.",
          edition: "No. 04",
        }),
      ],
    },
    {
      id: uid("page"),
      label: "Inside cover",
      title: "Nine moves, one read",
      tone: "dark",
      isIndexPage: true,
      blocks: [
        b("kicker", { label: "What's inside" }),
        b("heading", { title: "Nine moves, one read", sub: "The map of the field" }),
        b("rule", { bold: true }),
        b("text", {
          body: "The best playbooks absorb reality after every use. Capture what changed, who acts next, and what signal tells the team to reopen this page.",
        }),
        b("notes", { body: "Colophon — set in Bricolage, Newsreader & Plex Mono. Revised after every launch." }),
      ],
    },
    {
      id: uid("page"),
      label: "Move one",
      title: "Read the Field",
      tone: "paper",
      bgPreset: "cream",
      blocks: [
        b("heading", { title: "Read the Field", sub: "Before you call anything" }),
        b("rule", {}),
        b("text", {
          body: "Every play starts with a diagnosis. Name the defender, the clock, and the one thing that would make this week easier. Write it down before you write the feature.",
        }),
        b("numbers", {
          items: [
            { value: "1", label: "blocker" },
            { value: "1", label: "deadline" },
            { value: "1", label: "easy win" },
          ],
        }),
        b("notes", { body: "A diagnosis you cannot say in one sentence is still a hunch." }),
      ],
    },
    {
      id: uid("page"),
      label: "Move two",
      title: "Call the Play",
      tone: "paper",
      blocks: [
        b("kicker", { label: "Say it before it is ready" }),
        b("heading", { title: "Call the Play" }),
        b("rule", {}),
        b("text", {
          body: "1 · Lead with the move — verb first, the reason can follow.\n2 · Assign the ball — a play with two owners has none.\n3 · Set the count — deadline in hours, not quarters.\n4 · Agree the abort — decide now what would make you stop.",
          lineHeight: 1.6,
        }),
        b("quote", { text: "Call it loud.", attribution: "Rule of the edition" }),
      ],
    },
    {
      id: uid("page"),
      label: "Proof",
      title: "Momentum is a curve",
      tone: "paper",
      bgPreset: "sky",
      blocks: [
        b("kicker", { label: "Chart the habit, not the hype" }),
        b("heading", { title: "Momentum is a curve" }),
        b("chart", { kind: "line", title: "Activation vs repeats" }),
        b("text", {
          body: "Activation climbs when the second action is easier than the first. Watch the gap between the lines — that gap is your onboarding.",
        }),
      ],
    },
    {
      id: uid("page"),
      label: "Delivery",
      title: "Keep the tempo human",
      tone: "dark",
      blocks: [
        b("quote", { text: "Short instructions beat perfect theory while the team is still moving." }),
        b("rule", { bold: true }),
        b("text", {
          body: "Use sections as breaths: prepare, act, observe, adjust. Keep that cadence in the interface too — instant response while you drag, a slower settle when the page lands.",
        }),
        b("image", { src: defaultImage, caption: "Tempo — two beats per page", fit: "cover" }),
      ],
    },
    {
      id: uid("page"),
      label: "Preparation",
      title: "Drills before launch",
      tone: "paper",
      blocks: [
        b("kicker", { label: "Rehearse the hard part" }),
        b("heading", { title: "Drills before launch" }),
        b("text", {
          body: "Cold open read-through · Objection sparring · Pricing drill · Demo blackout · Handoff rehearsal.",
        }),
        b("numbers", {
          items: [
            { value: "5", label: "drills" },
            { value: "72%", label: "ready" },
            { value: "W6", label: "review" },
          ],
        }),
        b("notes", { body: "Tick a drill — the mark stays with the book." }),
      ],
    },
    {
      id: uid("page"),
      label: "Defense",
      title: "Signals & counters",
      tone: "paper",
      bgPreset: "cyan",
      blocks: [
        b("kicker", { label: "Read the pressure, answer early" }),
        b("heading", { title: "Signals & counters" }),
        b("quote", { text: "Two counters per signal. A third means the play was wrong." }),
        b("text", {
          body: "Silent champion → one question, one number, one date.\nScope creep → park it in the next edition.\nPricing stall → trade, do not explain.",
        }),
      ],
    },
    {
      id: uid("page"),
      label: "Readiness",
      title: "Readiness ledger",
      tone: "paper",
      blocks: [
        b("kicker", { label: "Score it honestly" }),
        b("heading", { title: "Readiness ledger" }),
        b("chart", { kind: "bar", title: "Ship readiness" }),
        b("text", {
          body: "Anything under seventy gets an owner and a date. Red is not a warning — it is a work item.",
        }),
      ],
    },
    {
      id: uid("page"),
      label: "Field notes",
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
      ],
    },
    {
      id: uid("page"),
      label: "Back cover",
      title: "Close the loop",
      tone: "closing",
      blocks: [
        b("kicker", { label: "End of edition 04" }),
        b("heading", { title: "Close the loop" }),
        b("text", {
          body: "What changed, who acts next, and what signal tells the team to open this book again. Everything else waits for the next edition.",
        }),
        b("rule", { bold: true }),
        b("notes", { body: "The long game." }),
      ],
    },
  ];

  pages.forEach((p) => {
    p.blocks.forEach((blk, i) => (blk.order = i));
  });

  return { title: "The Playbook", edition: "No. 04", flipSpeed: "slow", pages };
}
