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

const STORAGE_KEY = "playbook-session-v1";

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

  const value = useMemo<StoreValue>(
    () => ({
      session,
      updateTitle,
      setFlipAxis,
      setFlipSpeed,
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
    [session, updateTitle, setFlipAxis, setFlipSpeed, updatePageMeta, applyBgToAll, addPage, removePage, movePage, addBlock, updateBlock, removeBlock, moveBlock, duplicateBlock, reset],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
