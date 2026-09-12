import React, { createContext, useContext, useState, useEffect } from 'react';

export type PastelThemeId = 'butter' | 'oxford' | 'sage' | 'obsidian' | 'lavender';

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
    shortDesc: 'Warm custard cream with rich amber & crisp carbon ink (Default)',
    canvasHex: '#fffef7',
    cardHex: '#fbf5e6',
    accentHex: '#b45309',
    isDark: false,
  },
  {
    id: 'oxford',
    name: 'Royal Oxford & Cobalt',
    emoji: '🏛️',
    shortDesc: 'Midnight scholastic navy with crisp white text & royal cobalt',
    canvasHex: '#090e21',
    cardHex: '#101936',
    accentHex: '#3b82f6',
    isDark: true,
  },
  {
    id: 'sage',
    name: 'Sage & Terracotta',
    emoji: '🌿',
    shortDesc: 'Calming botanical eucalyptus with warm terracotta & deep pine',
    canvasHex: '#f4f8f5',
    cardHex: '#e8f1eb',
    accentHex: '#c2410c',
    isDark: false,
  },
  {
    id: 'lavender',
    name: 'Lavender & Amethyst',
    emoji: '🪻',
    shortDesc: 'Soft soothing lilac with royal amethyst (Dyslexia-friendly visual comfort)',
    canvasHex: '#faf8fd',
    cardHex: '#f2ecf8',
    accentHex: '#8b3dc7',
    isDark: false,
  },
  {
    id: 'obsidian',
    name: 'Obsidian & Amber (Night)',
    emoji: '🌙',
    shortDesc: 'Velvet dark study with glowing honey amber & pure white text',
    canvasHex: '#0a0e16',
    cardHex: '#131924',
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
