import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ClipboardHistoryItemWithImage } from "./events";
import { app } from "@tauri-apps/api";

type Context = {
  filters: {
    byApp?: string;
    byDate?: {
      from: Date | undefined;
      to: Date | undefined;
    };
    byType?: string;
    byText?: string;
  };
  settings: {
    theme: "light" | "dark";
    preserveWhitespace: boolean;
  };
  setSettings: (settings: Partial<Context["settings"]>) => void;
  availableFilters: {
    byApp: { appName: string; appIconSrc?: string }[];
  };
  setFilters: (filters: Partial<Context["filters"]>) => void;
  clipboardHistoryItems: ClipboardHistoryItemWithImage[];
  setClipboardHistoryItems: (items: ClipboardHistoryItemWithImage[]) => void;
  _pristineClipboardHistoryItems: ClipboardHistoryItemWithImage[];
};

function applyFilters(
  items: ClipboardHistoryItemWithImage[],
  filters: Context["filters"]
) {
  return items.filter((item) => {
    const sameAppName = filters.byApp && item.source_app === filters.byApp;
    const textMatch =
      filters.byText &&
      item.text &&
      item.content_type === "Text" &&
      item.text
        .toLocaleLowerCase()
        .includes(filters.byText.toLocaleLowerCase());
    const typeMatch = filters.byType && item.content_type === filters.byType;
    const itemTimestamp = new Date(item.timestamp);

    const dateMatch =
      filters.byDate &&
      itemTimestamp.getTime() >= filters.byDate.from?.getTime()! &&
      itemTimestamp.getTime() <= filters.byDate.to?.getTime()!;
    return (
      (!filters.byApp || sameAppName) &&
      (!filters.byText || textMatch) &&
      (!filters.byType || typeMatch) &&
      (!filters.byDate || dateMatch)
    );
  });
}

export const useStore = create(
  persist<Context>(
    (set) => ({
      filters: {
        byApp: undefined,
        byDate: undefined,
        byType: undefined,
        byText: undefined,
      },
      setFilters: (filters) => {
        set((state) => {
          const newFilters = {
            ...state.filters,
            ...filters,
          };
          return {
            filters: newFilters,
            clipboardHistoryItems: applyFilters(
              state._pristineClipboardHistoryItems,
              newFilters
            ),
          };
        });
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
      /**
       * Internal state to keep track of the original clipboard history items without filters
       */
      _pristineClipboardHistoryItems: [],
      clipboardHistoryItems: [],
      setClipboardHistoryItems: (items) =>
        set((state) => ({
          _pristineClipboardHistoryItems: items,
          clipboardHistoryItems: applyFilters(items, state.filters),
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
    }),
    {
      name: "context",
    }
  )
);
