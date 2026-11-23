/**
 * Theme ID types supported across the suite
 */
export type ThemeId =
  | "light-minimal"
  | "dark-oled"
  | "glass-aurora"
  | "cyberpunk-neon"
  | "a11y-contrast";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  description: string;
  icon: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "light-minimal",
    label: "Minimal Light",
    description: "Clean Swiss alabaster surface",
    icon: "☀️",
  },
  {
    id: "dark-oled",
    label: "OLED Dark",
    description: "True carbon black for low light",
    icon: "🌙",
  },
  {
    id: "glass-aurora",
    label: "Glass Aurora",
    description: "Frosted glassmorphism with indigo glows",
    icon: "✨",
  },
  {
    id: "cyberpunk-neon",
    label: "Cyberpunk Neon",
    description: "High-contrast electric cyan and magenta",
    icon: "⚡",
  },
  {
    id: "a11y-contrast",
    label: "AAA Contrast",
    description: "Max-legibility high-contrast theme",
    icon: "👁️",
  },
];

export const THEME_STORAGE_KEY = "suite_active_theme";

/**
 * Returns inline script that MUST be placed in <head> to prevent FOUC (Flash of Unstyled Content).
 */
export function getAntiFOUCScript(): string {
  return `(function(){try{const t=localStorage.getItem('${THEME_STORAGE_KEY}')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark-oled':'light-minimal');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
}

/**
 * Browser-side theme getter
 */
export function getActiveTheme(): ThemeId {
  if (typeof window === "undefined") return "light-minimal";
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
  if (stored && THEMES.some((t) => t.id === stored)) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark-oled" : "light-minimal";
}

/**
 * Browser-side theme setter
 */
export function setActiveTheme(theme: ThemeId): void {
  if (typeof window === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent("suite:theme-changed", { detail: { theme } }));
}

/**
 * Cycles to the next available theme in order
 */
export function cycleNextTheme(): ThemeId {
  const current = getActiveTheme();
  const index = THEMES.findIndex((t) => t.id === current);
  const nextTheme = THEMES[(index + 1) % THEMES.length].id;
  setActiveTheme(nextTheme);
  return nextTheme;
}
