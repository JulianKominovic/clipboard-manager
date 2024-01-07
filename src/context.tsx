import { create } from "zustand";
import { ClipboardHistoryItemWithImage } from "./events";

type Context = {
  filters: {
    byApp: string;
    byDate: string;
    byType: string;
    byText: string;
  };
  settings: {
    theme: "light" | "dark";
  };
  setSettings: (settings: Partial<Context["settings"]>) => void;
  availableFilters: {
    byApp: { appName: string; appIconSrc?: string }[];
  };
  setFilters: (filters: Partial<Context["filters"]>) => void;
  clipboardHistoryItems: ClipboardHistoryItemWithImage[];
  setClipboardHistoryItems: (items: ClipboardHistoryItemWithImage[]) => void;
};

export const useStore = create<Context>((set) => ({
  filters: {
    byApp: "",
    byDate: "",
    byType: "",
    byText: "",
  },
  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
      clipboardHistoryItems: state.clipboardHistoryItems.filter((item) => {
        if (filters.byApp && item.source_app !== filters.byApp) return false;
        if (filters.byDate && item.timestamp !== filters.byDate) return false;
        if (filters.byType && item.content_type !== filters.byType)
          return false;
        if (filters.byText && item.text && !item.text.includes(filters.byText))
          return false;
        return true;
      }),
    }));
  },
  settings: {
    theme: "dark",
  },
  setSettings: (settings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...settings,
      },
    }));
  },

  availableFilters: {
    byApp: [],
  },
  clipboardHistoryItems: [],
  setClipboardHistoryItems: (items) =>
    set(() => ({
      clipboardHistoryItems: items,
      availableFilters: {
        byApp: [...new Set(items.map((item) => item.source_app))]
          .filter((e) => e)
          .map((appName) => {
            const item = items.find((item) => item.source_app === appName);
            return {
              appName: appName as string,
              appIconSrc: item?.sourceAppIconSrc,
            };
          }),
      },
    })),
}));
