import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppTheme, defaultTheme } from "@/theme/theme.types";

interface ThemeState {
  theme: AppTheme;
  updateTheme: (updates: Partial<AppTheme>) => void;
  resetTheme: () => void;
  applyPreset: (presetName: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: defaultTheme,

      updateTheme: (updates) =>
        set((state) => ({
          theme: { ...state.theme, ...updates },
        })),

      resetTheme: () => set({ theme: defaultTheme }),

      applyPreset: (presetName) => {
        const presets: Record<string, AppTheme> = {
          burgundy: defaultTheme,
          ocean: {
            ...defaultTheme,
            primary: "#0284c7",
            secondary: "#0ea5e9",
            sidebarGradientStart: "#0c4a6e",
            sidebarGradientEnd: "#075985",
            sidebarActiveItem: "#0284c7",
          },
          forest: {
            ...defaultTheme,
            primary: "#059669",
            secondary: "#10b981",
            sidebarGradientStart: "#064e3b",
            sidebarGradientEnd: "#065f46",
            sidebarActiveItem: "#059669",
          },
          sunset: {
            ...defaultTheme,
            primary: "#dc2626",
            secondary: "#f97316",
            sidebarGradientStart: "#7c2d12",
            sidebarGradientEnd: "#9a3412",
            sidebarActiveItem: "#dc2626",
          },
        };

        set({ theme: presets[presetName] || defaultTheme });
        /*
          (set) => ({
            theme: defaultTheme,
            updateTheme: (updates) => set((state) => ({ theme: { ...state.theme, ...updates } })),
             ... rest stays same
          })
        */
      },
    }),
    {
      name: "theme-storage",
    },
  ),
);
