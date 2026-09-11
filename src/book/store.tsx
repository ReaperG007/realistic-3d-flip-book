import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  makeBlock,
  uid,
  type Block,
  type BlockType,
  type BookPage,
  type FlipAxis,
  type FlipSpeed,
  type Session,
} from "./model";
import { seedSession } from "./seed";

type PageBgPatch = {
  bgPreset?: BookPage["bgPreset"];
  customBgColor?: string;
  bgImage?: string;
  bgImageOpacity?: number;
  bgImageFit?: BookPage["bgImageFit"];
  bgBlendMode?: BookPage["bgBlendMode"];
};

type StoreValue = {
  session: Session;
  updateTitle: (title: string) => void;
  setFlipAxis: (flipAxis: FlipAxis) => void;
  setFlipSpeed: (flipSpeed: FlipSpeed) => void;
  importSession: (next: Session) => void;
  updatePageMeta: (
    pageId: string,
    patch: Partial<Omit<BookPage, "id" | "blocks">>
  ) => void;
  applyBgToAll: (bgConfig: PageBgPatch) => void;
  addPage: (afterId?: string) => string;
  removePage: (pageId: string) => void;
  movePage: (pageId: string, direction: -1 | 1) => void;
  addBlock: (pageId: string, type: BlockType) => string;
  updateBlock: (pageId: string, blockId: string, patch: Partial<Block> & Record<string, unknown>) => void;
  removeBlock: (pageId: string, blockId: string) => void;
  moveBlock: (pageId: string, blockId: string, direction: -1 | 1) => void;
  duplicateBlock: (pageId: string, blockId: string) => void;
  reset: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const STORAGE_KEY = "playbook-session-playbook-v1";

function loadSession(): Session {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Session;
      if (parsed && Array.isArray(parsed.pages) && parsed.pages.length) return parsed;
    }
  } catch {
    /* corrupted storage — fall back to seed */
  }
  return seedSession();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(loadSession);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* storage full / unavailable */
    }
  }, [session]);

  const updateTitle = useCallback((title: string) => {
    setSession((s) => ({ ...s, title }));
  }, []);

  const setFlipAxis = useCallback<StoreValue["setFlipAxis"]>((flipAxis) => {
    setSession((s) => ({ ...s, flipAxis }));
  }, []);

  const setFlipSpeed = useCallback<StoreValue["setFlipSpeed"]>((flipSpeed) => {
    setSession((s) => ({ ...s, flipSpeed }));
  }, []);

  const updatePageMeta = useCallback<StoreValue["updatePageMeta"]>((pageId, patch) => {
    setSession((s) => ({
      ...s,
      pages: s.pages.map((p) => {
        if (p.id === pageId) {
          return { ...p, ...patch };
        }
        if (patch.isIndexPage) {
          return { ...p, isIndexPage: false };
        }
        return p;
      }),
    }));
  }, []);

  const applyBgToAll = useCallback<StoreValue["applyBgToAll"]>((bgConfig) => {
    setSession((s) => ({
      ...s,
      pages: s.pages.map((p) => ({
        ...p,
        ...bgConfig,
      })),
    }));
  }, []);

  const addPage = useCallback<StoreValue["addPage"]>((afterId) => {
    const id = uid("page");
    setSession((s) => {
      const idx = afterId ? s.pages.findIndex((p) => p.id === afterId) : s.pages.length - 1;
      const page: BookPage = {
        id,
        label: "New page",
        title: "Untitled",
        tone: "paper",
        blocks: [makeBlock("heading")],
      };
      const next = [...s.pages];
      next.splice(idx + 1, 0, page);
      return { ...s, pages: next };
    });
    return id;
  }, []);

  const removePage = useCallback<StoreValue["removePage"]>((pageId) => {
    setSession((s) => {
      if (s.pages.length <= 1) return s;
      return { ...s, pages: s.pages.filter((p) => p.id !== pageId) };
    });
  }, []);

  const movePage = useCallback<StoreValue["movePage"]>((pageId, direction) => {
    setSession((s) => {
      const i = s.pages.findIndex((p) => p.id === pageId);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= s.pages.length) return s;
      const next = [...s.pages];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...s, pages: next };
    });
  }, []);

  const addBlock = useCallback<StoreValue["addBlock"]>((pageId, type) => {
    const id = uid();
    setSession((s) => ({
      ...s,
      pages: s.pages.map((p) => {
        if (p.id !== pageId) return p;
        const order = p.blocks.length ? Math.max(...p.blocks.map((b) => b.order)) + 1 : 0;
        return { ...p, blocks: [...p.blocks, { ...makeBlock(type), id, order }] };
      }),
    }));
    return id;
  }, []);

  const updateBlock = useCallback<StoreValue["updateBlock"]>((pageId, blockId, patch) => {
    setSession((s) => ({
      ...s,
      pages: s.pages.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) => {
            if (b.id !== blockId) return b;
            const dataPatch = (patch as { data?: Record<string, unknown> }).data ?? {};
            const next = {
              ...(b as Record<string, unknown>),
              ...(patch as Record<string, unknown>),
              data: { ...(b.data as Record<string, unknown>), ...dataPatch },
            };
            return next as Block;
          }),
        };
      }),
    }));
  }, []);

  const removeBlock = useCallback<StoreValue["removeBlock"]>((pageId, blockId) => {
    setSession((s) => ({
      ...s,
      pages: s.pages.map((p) => (p.id === pageId ? { ...p, blocks: p.blocks.filter((b) => b.id !== blockId) } : p)),
    }));
  }, []);

  const moveBlock = useCallback<StoreValue["moveBlock"]>((pageId, blockId, direction) => {
    setSession((s) => ({
      ...s,
      pages: s.pages.map((p) => {
        if (p.id !== pageId) return p;
        const sorted = [...p.blocks].sort((a, b) => a.order - b.order);
        const i = sorted.findIndex((b) => b.id === blockId);
        const j = i + direction;
        if (i < 0 || j < 0 || j >= sorted.length) return p;
        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
        return { ...p, blocks: sorted.map((b, k) => ({ ...b, order: k })) };
      }),
    }));
  }, []);

  const duplicateBlock = useCallback<StoreValue["duplicateBlock"]>((pageId, blockId) => {
    setSession((s) => ({
      ...s,
      pages: s.pages.map((p) => {
        if (p.id !== pageId) return p;
        const sorted = [...p.blocks].sort((a, b) => a.order - b.order);
        const i = sorted.findIndex((b) => b.id === blockId);
        if (i < 0) return p;
        const copy: Block = {
          ...(sorted[i] as Block),
          id: uid(),
          data: JSON.parse(JSON.stringify((sorted[i] as Block).data)),
        };
        sorted.splice(i + 1, 0, copy);
        return { ...p, blocks: sorted.map((b, k) => ({ ...b, order: k })) };
      }),
    }));
  }, []);

  const reset = useCallback(() => {
    setSession(seedSession());
  }, []);

  const importSession = useCallback<StoreValue["importSession"]>((next) => {
    // basic shape validation — keep seed fallback for corrupted payloads
    if (!next || typeof next.title !== "string" || !Array.isArray(next.pages) || next.pages.length === 0) {
      throw new Error("Invalid project file: missing title or pages");
    }
    // ensure every page has an id/title/label/blocks array so the reader never crashes
    const pages: BookPage[] = next.pages.map((p: unknown) => {
      const page = p as Partial<BookPage>;
      return {
        id: typeof page.id === "string" && page.id ? page.id : uid("page"),
        label: typeof page.label === "string" ? page.label : "Page",
        title: typeof page.title === "string" ? page.title : "Untitled",
        tone: (page.tone as BookPage["tone"]) ?? "paper",
        bgPreset: page.bgPreset,
        customBgColor: page.customBgColor,
        bgImage: page.bgImage,
        bgImageOpacity: page.bgImageOpacity,
        bgImageFit: page.bgImageFit,
        bgBlendMode: page.bgBlendMode,
        isIndexPage: !!page.isIndexPage,
        blocks: Array.isArray(page.blocks) ? (page.blocks as Block[]) : [],
      };
    });
    // enforce single TOC page — keep first isIndexPage true, clear the rest
    let seenIndex = false;
    for (const pg of pages) {
      if (pg.isIndexPage) {
        if (seenIndex) pg.isIndexPage = false;
        else seenIndex = true;
      }
    }
    // normalize block order per page
    for (const pg of pages) {
      pg.blocks.forEach((blk, i) => {
        if (typeof blk.order !== "number") blk.order = i;
      });
      pg.blocks.sort((a, b) => a.order - b.order);
      pg.blocks.forEach((blk, i) => (blk.order = i));
    }
    const clean: Session = {
      title: next.title,
      edition: typeof next.edition === "string" ? next.edition : "No. 01",
      flipAxis: next.flipAxis === "vertical" ? "vertical" : "horizontal",
      flipSpeed: next.flipSpeed ?? "slow",
      pages,
    };
    setSession(clean);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      session,
      updateTitle,
      setFlipAxis,
      setFlipSpeed,
      importSession,
      updatePageMeta,
      applyBgToAll,
      addPage,
      removePage,
      movePage,
      addBlock,
      updateBlock,
      removeBlock,
      moveBlock,
      duplicateBlock,
      reset,
    }),
    [session, updateTitle, setFlipAxis, setFlipSpeed, importSession, updatePageMeta, applyBgToAll, addPage, removePage, movePage, addBlock, updateBlock, removeBlock, moveBlock, duplicateBlock, reset],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
