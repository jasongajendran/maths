import React, { createContext, useContext, useState, useEffect } from 'react';

export type PastelThemeId = 'mint' | 'lavender' | 'peach' | 'sky' | 'butter';

export interface PastelTheme {
  id: PastelThemeId;
  name: string;
  emoji: string;
  shortDesc: string;
  canvasHex: string;
  cardHex: string;
  accentHex: string;
}

export const PASTEL_THEMES: PastelTheme[] = [
  {
    id: 'mint',
    name: 'Mint & Sage',
    emoji: '🌿',
    shortDesc: 'Calming minty pastel',
    canvasHex: '#ebf5ee',
    cardHex: '#e3f2e8',
    accentHex: '#277953',
  },
  {
    id: 'lavender',
    name: 'Lavender & Lilac',
    emoji: '🪻',
    shortDesc: 'Gentle floral purple pastel',
    canvasHex: '#f1ebf9',
    cardHex: '#e9e1f5',
    accentHex: '#723ebc',
  },
  {
    id: 'peach',
    name: 'Peach & Apricot',
    emoji: '🍑',
    shortDesc: 'Warm cozy apricot pastel',
    canvasHex: '#fdf0e8',
    cardHex: '#fae4d7',
    accentHex: '#cb4e31',
  },
  {
    id: 'sky',
    name: 'Sky & Cloud',
    emoji: '☁️',
    shortDesc: 'Cool peaceful blue pastel',
    canvasHex: '#e8f3fa',
    cardHex: '#dcecf6',
    accentHex: '#226ea5',
  },
  {
    id: 'butter',
    name: 'Buttercup & Honey',
    emoji: '🍯',
    shortDesc: 'Sunny golden custard pastel',
    canvasHex: '#faf4e5',
    cardHex: '#f5edd7',
    accentHex: '#a76b17',
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
      const saved = localStorage.getItem('maths-master-pastel-theme');
      if (saved && PASTEL_THEMES.some((t) => t.id === saved)) {
        return saved as PastelThemeId;
      }
    }
    return 'mint';
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
