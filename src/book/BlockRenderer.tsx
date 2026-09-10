import { Bar, Line } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  type ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import type { Block } from "./model";
import GenericBlockRenderer from "./GenericBlock";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

const lineData = {
  labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
  datasets: [
    {
      label: "Activation",
      data: [12, 18, 27, 34, 46, 58, 66, 74],
      borderColor: "#c0432c",
      backgroundColor: "rgba(192,67,44,0.14)",
      fill: true,
      tension: 0.38,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: "#c0432c",
      borderWidth: 2.5,
    },
    {
      label: "Repeats",
      data: [6, 9, 14, 21, 26, 33, 41, 52],
      borderColor: "#2c6f63",
      backgroundColor: "rgba(44,111,99,0.12)",
      fill: true,
      tension: 0.42,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: "#2c6f63",
      borderWidth: 2.5,
    },
  ],
};

const lineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: "easeOutQuart" },
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { display: false } },
    y: { beginAtZero: true, max: 100, grid: { color: "rgba(28,32,30,0.12)" }, ticks: { display: false } },
  },
};

const barData = {
  labels: ["Story", "Demo", "Pricing", "Docs", "Support", "Handoff"],
  datasets: [
    {
      label: "Ready",
      data: [92, 78, 64, 71, 55, 84],
      backgroundColor: ["#2c6f63", "#2c6f63", "#d99b2b", "#2c6f63", "#c0432c", "#2c6f63"],
      borderRadius: 3,
      barThickness: 13,
    },
  ],
};

const barOptions: ChartOptions<"bar"> = {
  indexAxis: "y",
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900 },
  plugins: { legend: { display: false } },
  scales: {
    x: { max: 100, grid: { color: "rgba(28,32,30,0.1)" }, ticks: { display: false } },
    y: { grid: { display: false }, ticks: { font: { family: "IBM Plex Mono", size: 9.5 } } },
  },
};

function ChartBlock({ kind, title }: { kind: "line" | "bar"; title?: string }) {
  return (
    <figure className="rm-chart">
      {title && <figcaption className="rm-chart-title">{title}</figcaption>}
      <div className="rm-chart-box">
        {kind === "line" ? <Line data={lineData} options={lineOptions} /> : <Bar data={barData} options={barOptions} />}
      </div>
    </figure>
  );
}

/** Render a single content block onto the page. `target` lets the editor mark it. */
export default function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "cover":
      return (
        <figure className="rm-cover">
          <div className="rm-cover-crest" aria-hidden>
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="53" />
              <circle className="crest-dash" cx="60" cy="60" r="45" />
              <path d="M30 78 L60 28 L90 78" />
              <path d="M43 78 L60 50 L77 78" />
              <path d="M28 90 H92" />
            </svg>
          </div>
          <figcaption className="rm-cover-edition">{block.data.edition}</figcaption>
          <div className="rm-cover-body">
            <span className="rm-cover-rule" />
            <h1 className="rm-cover-title">{block.data.title}</h1>
            <span className="rm-cover-rule" />
            {block.data.subtitle && <p className="rm-cover-subtitle">{block.data.subtitle}</p>}
          </div>
        </figure>
      );
    case "heading":
      return (
        <h2 className="rm-heading">
          {block.data.title}
          {block.data.sub ? <span className="rm-heading-sub">{block.data.sub}</span> : null}
        </h2>
      );
    case "kicker":
      return <p className="rm-kicker">{block.data.label}</p>;
    case "text":
      return (
        <p className="rm-text" style={{ fontSize: `${block.data.size ?? 15}px`, lineHeight: block.data.lineHeight ?? 1.55 }}>
          {block.data.body}
        </p>
      );
    case "quote":
      return (
        <blockquote className="rm-quote">
          <span aria-hidden>“</span>
          <p>{block.data.text}</p>
          {block.data.attribution && <cite>— {block.data.attribution}</cite>}
        </blockquote>
      );
    case "rule":
      return <div className={block.data.bold ? "rm-rule rm-rule-bold" : "rm-rule"} />;
    case "divider":
      return (
        <div className="rm-divider">
          <span />
          {block.data.label && <em>{block.data.label}</em>}
          <span />
        </div>
      );
    case "image":
      return (
        <figure className={`rm-media rm-media-${block.data.fit}`}>
          <img src={block.data.src} alt={block.data.alt || block.data.caption || ""} />
          {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
        </figure>
      );
    case "video":
      return (
        <figure className={`rm-media rm-media-${block.data.fit} rm-video`}>
          <video
            src={block.data.src}
            poster={block.data.cover || undefined}
            controls
            playsInline
            preload="metadata"
          />
          {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
        </figure>
      );
    case "chart":
      return <ChartBlock kind={block.data.kind} title={block.data.title} />;
    case "numbers":
      return (
        <div className="rm-numbers">
          {block.data.items.map((it, i) => (
            <div key={i} className="rm-num">
              <strong>{it.value}</strong>
              <span>{it.label}</span>
            </div>
          ))}
        </div>
      );
    case "notes":
      return <aside className="rm-note">{block.data.body}</aside>;
    default:
      return <GenericBlockRenderer block={block} />;
  }
}
