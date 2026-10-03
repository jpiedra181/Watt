import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMediaQuery } from '@/lib/useMediaQuery';

export { useMediaQuery };

type Theme = 'light' | 'dark';

interface Preferences {
  /** Effective theme (explicit choice or the OS setting). */
  theme: Theme;
  toggleTheme: () => void;
  /** null = automatic (collapsed below 1280px). */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const PreferencesContext = createContext<Preferences | null>(null);

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: keep the choice for this visit only */
  }
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const wide = useMediaQuery('(min-width: 1280px)');
  const [explicitTheme, setExplicitTheme] = useState<Theme | null>(() => {
    const t = read('watt-theme');
    return t === 'light' || t === 'dark' ? t : null;
  });
  const [explicitCollapsed, setExplicitCollapsed] = useState<boolean | null>(() => {
    const v = read('watt-sidebar');
    return v === 'collapsed' ? true : v === 'expanded' ? false : null;
  });

  const theme: Theme = explicitTheme ?? (prefersDark ? 'dark' : 'light');

  useEffect(() => {
    if (explicitTheme) document.documentElement.dataset.theme = explicitTheme;
    else delete document.documentElement.dataset.theme;
  }, [explicitTheme]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setExplicitTheme(next);
    write('watt-theme', next);
  }, [theme]);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setExplicitCollapsed(collapsed);
    write('watt-sidebar', collapsed ? 'collapsed' : 'expanded');
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, sidebarCollapsed: explicitCollapsed ?? !wide, setSidebarCollapsed }),
    [theme, toggleTheme, explicitCollapsed, wide, setSidebarCollapsed],
  );

  return <PreferencesContext value={value}>{children}</PreferencesContext>;
}

export function usePreferences() {
  const ctx = use(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return ctx;
}
