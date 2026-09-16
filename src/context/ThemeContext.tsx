import React, { createContext, useContext, useState, useEffect } from 'react';

export type PastelThemeId = 'butter' | 'sage' | 'obsidian';

export interface PastelTheme {
  id: PastelThemeId;
  name: string;
  emoji: string;
  shortDesc: string;
  canvasHex: string;
  cardHex: string;
  accentHex: string;
  isDark?: boolean;
}

export const PASTEL_THEMES: PastelTheme[] = [
  {
    id: 'butter',
    name: 'Buttercup & Honey',
    emoji: '🍯',
    shortDesc: 'Warm custard cream with rich amber & crisp carbon ink (Daytime Default)',
    canvasHex: '#fffdf5',
    cardHex: '#fbf5e6',
    accentHex: '#b45309',
    isDark: false,
  },
  {
    id: 'sage',
    name: 'Sage & Terracotta',
    emoji: '🌿',
    shortDesc: 'Calming botanical eucalyptus with warm terracotta & deep pine (Focus & Comfort)',
    canvasHex: '#f2f7f4',
    cardHex: '#e4eee7',
    accentHex: '#c2410c',
    isDark: false,
  },
  {
    id: 'obsidian',
    name: 'Obsidian & Amber',
    emoji: '🌙',
    shortDesc: 'Velvet slate dark study with glowing honey amber & pure crisp text (Night Mode)',
    canvasHex: '#090d16',
    cardHex: '#131b28',
    accentHex: '#f59e0b',
    isDark: true,
  },
];

interface ThemeContextType {
  theme: PastelThemeId;
  setTheme: (theme: PastelThemeId) => void;
  currentThemeObj: PastelTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<PastelThemeId>(() => {
    if (typeof window !== 'undefined') {
      const v2 = localStorage.getItem('maths-master-default-butter-v1');
      if (!v2) {
        localStorage.setItem('maths-master-default-butter-v1', 'true');
        localStorage.setItem('maths-master-pastel-theme', 'butter');
        return 'butter';
      }
      const saved = localStorage.getItem('maths-master-pastel-theme');
      if (saved && PASTEL_THEMES.some((t) => t.id === saved)) {
        return saved as PastelThemeId;
      }
      localStorage.setItem('maths-master-pastel-theme', 'butter');
    }
    return 'butter';
  });

  const setTheme = (newTheme: PastelThemeId) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('maths-master-pastel-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'obsidian');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'obsidian');
  }, [theme]);

  const currentThemeObj = PASTEL_THEMES.find((t) => t.id === theme) || PASTEL_THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentThemeObj }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const usePastelTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('usePastelTheme must be used within a ThemeProvider');
  }
  return context;
};
