import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSizeLevel = 'normal' | 'large' | 'xlarge';
export type FontFamilyChoice = 'lexend' | 'nunito' | 'jakarta';

export interface FontSizeOption {
  id: FontSizeLevel;
  label: string;
  shortLabel: string;
  percentage: string;
  basePx: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { id: 'normal', label: 'Standard', shortLabel: '100%', percentage: '100%', basePx: '17px' },
  { id: 'large', label: 'Large (+15%)', shortLabel: '115%', percentage: '115%', basePx: '19.5px' },
  { id: 'xlarge', label: 'Extra Large (+30%)', shortLabel: '130%', percentage: '130%', basePx: '22px' },
];

export interface FontFamilyOption {
  id: FontFamilyChoice;
  name: string;
  tagline: string;
  cssFamily: string;
}

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  {
    id: 'lexend',
    name: 'Lexend',
    tagline: 'Best for Reading & Numbers (Recommended)',
    cssFamily: "'Lexend', sans-serif",
  },
  {
    id: 'nunito',
    name: 'Nunito',
    tagline: 'Friendly & Rounded (Great for Kids)',
    cssFamily: "'Nunito', sans-serif",
  },
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    tagline: 'Clean Modern Geometric',
    cssFamily: "'Plus Jakarta Sans', sans-serif",
  },
];

interface TypographyContextType {
  fontSize: FontSizeLevel;
  setFontSize: (size: FontSizeLevel) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  fontFamily: FontFamilyChoice;
  setFontFamily: (family: FontFamilyChoice) => void;
  currentSizeObj: FontSizeOption;
  currentFontObj: FontFamilyOption;
}

const TypographyContext = createContext<TypographyContextType | undefined>(undefined);

export const TypographyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSizeLevel>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maths-master-font-size');
      if (saved && (saved === 'normal' || saved === 'large' || saved === 'xlarge')) {
        return saved as FontSizeLevel;
      }
    }
    return 'normal';
  });

  const [fontFamily, setFontFamilyState] = useState<FontFamilyChoice>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maths-master-font-family');
      if (saved && (saved === 'lexend' || saved === 'nunito' || saved === 'jakarta')) {
        return saved as FontFamilyChoice;
      }
    }
    return 'lexend';
  });

  const setFontSize = (newSize: FontSizeLevel) => {
    setFontSizeState(newSize);
    if (typeof window !== 'undefined') {
      localStorage.setItem('maths-master-font-size', newSize);
      document.documentElement.setAttribute('data-font-size', newSize);
    }
  };

  const setFontFamily = (newFamily: FontFamilyChoice) => {
    setFontFamilyState(newFamily);
    if (typeof window !== 'undefined') {
      localStorage.setItem('maths-master-font-family', newFamily);
      document.documentElement.setAttribute('data-font-family', newFamily);
    }
  };

  const increaseFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'xlarge') setFontSize('large');
    else if (fontSize === 'large') setFontSize('normal');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.setAttribute('data-font-family', fontFamily);
  }, [fontSize, fontFamily]);

  const currentSizeObj =
    FONT_SIZE_OPTIONS.find((o) => o.id === fontSize) || FONT_SIZE_OPTIONS[0];
  const currentFontObj =
    FONT_FAMILY_OPTIONS.find((o) => o.id === fontFamily) || FONT_FAMILY_OPTIONS[0];

  return (
    <TypographyContext.Provider
      value={{
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        fontFamily,
        setFontFamily,
        currentSizeObj,
        currentFontObj,
      }}
    >
      {children}
    </TypographyContext.Provider>
  );
};

export const useTypography = () => {
  const context = useContext(TypographyContext);
  if (!context) {
    throw new Error('useTypography must be used within a TypographyProvider');
  }
  return context;
};
