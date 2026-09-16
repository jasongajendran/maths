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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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
        title={`Current Theme: ${currentThemeObj.name} (Click to switch)`}
      >
        <Palette size={15} style={{ color: 'var(--accent-primary)' }} />
        <span className="text-sm leading-none">{currentThemeObj.emoji}</span>
        <span className="hidden lg:inline font-bold text-xs">{currentThemeObj.shortName}</span>
        {/* Visual pastel swatches - shown on xl screens */}
        <span className="hidden xl:flex items-center gap-0.5 ml-0.5">
          <span
            className="w-2 h-2 rounded-full border border-black/10 shadow-2xs"
            style={{ backgroundColor: currentThemeObj.canvasHex }}
          />
          <span
            className="w-2 h-2 rounded-full border border-black/10 shadow-2xs"
            style={{ backgroundColor: currentThemeObj.accentHex }}
          />
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-1.5rem)] rounded-xl shadow-xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card-strong)',
          }}
        >
          <div className="px-2.5 py-1.5 border-b mb-1.5" style={{ borderColor: 'var(--border-card)' }}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
              Choose Reading Palette
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              3 refined, eye-safe high-contrast themes
            </span>
          </div>

          <div className="space-y-1.5">
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
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer border"
                  style={{
                    backgroundColor: isSelected ? 'var(--reading-highlight-bg)' : 'var(--bg-card-subtle)',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-start gap-2.5 pr-2">
                    <span className="text-lg leading-none mt-0.5">{t.emoji}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold leading-tight">{t.name}</span>
                        {t.isDark ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-300">
                            Night
                          </span>
                        ) : t.id === 'butter' ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase bg-amber-600/10 text-amber-700">
                            Default
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase bg-emerald-600/10 text-emerald-800">
                            Calm
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] opacity-80 font-medium block mt-0.5 leading-snug">{t.shortDesc}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center -space-x-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: t.canvasHex }}
                        title="Canvas tone"
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: t.cardHex }}
                        title="Card surface"
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: t.accentHex }}
                        title="Accent"
                      />
                    </div>
                    {isSelected && <Check size={14} className="shrink-0 font-black" style={{ color: 'var(--accent-primary)' }} />}
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
