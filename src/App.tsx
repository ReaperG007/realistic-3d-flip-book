import { useEffect, useMemo, useState } from "react";
import { MonitorPlay, Pencil } from "lucide-react";
import { StoreProvider, useStore } from "./book/store";
import Reader from "./components/Reader";
import Editor from "./components/Editor";

function AppInner() {
  const { session } = useStore();
  const [editorOpen, setEditorOpen] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // keep a selected page at all times while editing
  useEffect(() => {
    if (!selectedId || !session.pages.some((p) => p.id === selectedId)) {
      setSelectedId(session.pages[0]?.id ?? null);
    }
  }, [session.pages, selectedId]);

  const motes = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: `${(i * 7.3 + (i % 4) * 11) % 96}%`,
        top: `${18 + ((i * 13) % 70)}%`,
        size: 1.4 + ((i * 5) % 4) * 0.7,
        duration: 15 + ((i * 3) % 5) * 4,
        delay: -(i * 1.9),
      })),
    [],
  );

  return (
    <main className="relative min-h-screen">
      <div className="desk">
        <div className="desk-lamp" />
        <div className="desk-grid" />
        {motes.map((m) => (
          <span
            key={m.id}
            className="mote"
            style={{
              left: m.left,
              top: m.top,
              width: `${m.size}px`,
              height: `${m.size}px`,
              animationDuration: `${m.duration}s`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}
        <div className="desk-vignette" />
      </div>

      <Reader interactive={!editorOpen} presenting={presenting} />

      {/* mode toolbar */}
      <div className="mode-bar">
        <button
          className={`mode-toggle ${editorOpen ? "mode-toggle-on" : ""}`}
          onClick={() => {
            setEditorOpen((v) => !v);
            setPresenting(false);
          }}
        >
          <Pencil size={15} />
          <span className="font-mono">Edit</span>
        </button>
        <button
          className={`mode-toggle mode-toggle-present ${presenting ? "mode-toggle-on" : ""}`}
          onClick={() => {
            setPresenting((v) => !v);
            setEditorOpen(false);
          }}
        >
          <MonitorPlay size={15} />
          <span className="font-mono">Present</span>
        </button>
      </div>

      {/* presentation chrome */}
      <div className={`present-bar ${presenting ? "present-bar-on" : ""}`}>
        <span className="present-dot" />
        <span className="font-mono">Presentation output</span>
        <button className="present-exit" onClick={() => setPresenting(false)}>
          Close
        </button>
      </div>

      <Editor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <div className="grain-overlay" />
    </main>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
