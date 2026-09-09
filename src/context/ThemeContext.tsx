import React, { createContext, useContext, useState, useEffect } from 'react';

export type PastelThemeId = 'butter' | 'oxford' | 'sage' | 'obsidian';

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
    shortDesc: 'Warm golden custard with rich amber & crisp ink contrast (Default)',
    canvasHex: '#fffdf5',
    cardHex: '#fef5dc',
    accentHex: '#b45309',
    isDark: false,
  },
  {
    id: 'oxford',
    name: 'Royal Oxford & Cobalt',
    emoji: '🏛️',
    shortDesc: 'Deep Oxford midnight navy with crisp chalk white text & royal cobalt',
    canvasHex: '#0b1329',
    cardHex: '#132042',
    accentHex: '#3b82f6',
    isDark: true,
  },
  {
    id: 'sage',
    name: 'Sage & Terracotta',
    emoji: '🌿',
    shortDesc: 'Calming botanical eucalyptus with warm terracotta & deep pine',
    canvasHex: '#f2f7f4',
    cardHex: '#e5efe8',
    accentHex: '#c2410c',
    isDark: false,
  },
  {
    id: 'obsidian',
    name: 'Obsidian & Amber (Night)',
    emoji: '🌙',
    shortDesc: 'Velvet dark study with glowing honey amber & pure white text',
    canvasHex: '#0c0f17',
    cardHex: '#161c28',
    accentHex: '#fbbf24',
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
    }
    return 'butter';
  });

  const setTheme = (newTheme: PastelThemeId) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('maths-master-pastel-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
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
