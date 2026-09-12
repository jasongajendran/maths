import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { usePastelTheme, PASTEL_THEMES, PastelThemeId } from '../context/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, currentThemeObj } = usePastelTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id="theme-selector-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs border shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card-strong)',
          color: 'var(--text-primary)',
        }}
        title="Switch Pastel Theme"
      >
        <Palette size={15} style={{ color: 'var(--accent-primary)' }} />
        <span className="text-sm leading-none">{currentThemeObj.emoji}</span>
        <span className="hidden md:inline font-bold text-xs">{currentThemeObj.name}</span>
        {/* Visual pastel swatches - shown on larger screens */}
        <span className="hidden md:flex items-center gap-0.5 ml-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
            style={{ backgroundColor: currentThemeObj.canvasHex }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
            style={{ backgroundColor: currentThemeObj.cardHex }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
            style={{ backgroundColor: currentThemeObj.accentHex }}
          />
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-60 sm:w-64 max-w-[calc(100vw-1.5rem)] rounded-xl shadow-xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card-strong)',
          }}
        >
          <div className="px-2.5 py-1.5 border-b mb-1" style={{ borderColor: 'var(--border-card)' }}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
              Choose Distinct Theme
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              5 distinct, eye-safe high-contrast palettes
            </span>
          </div>

          <div className="space-y-1">
            {PASTEL_THEMES.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id as PastelThemeId);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? 'var(--reading-highlight-bg)' : 'transparent',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{t.emoji}</span>
                    <div>
                      <span className="font-bold block leading-tight">{t.name}</span>
                      <span className="text-[10px] opacity-75 font-normal">{t.shortDesc}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center -space-x-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: t.canvasHex }}
                        title="Canvas"
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: t.cardHex }}
                        title="Card"
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: t.accentHex }}
                        title="Accent"
                      />
                    </div>
                    {isSelected && <Check size={14} style={{ color: 'var(--accent-primary)' }} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
