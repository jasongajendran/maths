import React from 'react';
import { BookOpen, BookmarkCheck, FileText, Menu, X, Sparkles } from 'lucide-react';
import { YearLevel, CategoryId } from '../types/math';
import { mathTopics } from '../data/mathTopics';
import { AudioButton } from './AudioButton';
import { ThemeSelector } from './ThemeSelector';

interface HeaderProps {
  selectedYear: YearLevel | 'All';
  onSelectYear: (year: YearLevel | 'All') => void;
  onOpenFormulaDrawer: () => void;
  isMobileNavOpen: boolean;
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedYear,
  onSelectYear,
  onOpenFormulaDrawer,
  isMobileNavOpen,
  onToggleMobileNav,
}) => {
  const yearOptions: (YearLevel | 'All')[] = [
    'All',
    'Primary 5 / Year 5 (Age 9-10)',
    'Primary 6 / Year 6 (Age 10-11)',
    'Primary 7 / Year 7 (Age 11-12)',
    'Year 8+ / KS3 (Age 12+)',
  ];

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md border-b shadow-2xs transition-colors"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-card-strong)',
      }}
    >
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4 w-full">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onToggleMobileNav}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg cursor-pointer transition-colors shrink-0"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-card-subtle)',
              }}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileNavOpen ? <X size={19} /> : <Menu size={19} />}
            </button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-white flex items-center justify-center shadow-xs shrink-0"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                }}
              >
                <span className="font-serif font-black text-lg sm:text-xl tracking-tighter">∑</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-nowrap">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                    Maths Master
                  </span>
                  <span
                    className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0"
                    style={{
                      backgroundColor: 'var(--badge-bg)',
                      color: 'var(--badge-text)',
                      borderColor: 'var(--border-card-strong)',
                    }}
                  >
                    Primary 5+ / Age 9+
                  </span>
                </div>
                <p className="hidden md:block text-[11px] font-medium -mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  UK Curriculum Mathematics • Ages 9 to 12+
                </p>
              </div>
            </div>
          </div>

          {/* Theme Selector, Formula Vault & Audio Intro */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Theme Selector */}
            <ThemeSelector />

            <button
              type="button"
              onClick={onOpenFormulaDrawer}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-colors cursor-pointer shadow-2xs shrink-0"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderColor: 'var(--border-card-strong)',
                color: 'var(--text-primary)',
              }}
              title="Open Formula & Rules Vault"
            >
              <FileText size={15} style={{ color: 'var(--accent-primary)' }} />
              <span className="hidden sm:inline">Formula Vault</span>
            </button>

            <AudioButton
              id="audio-header-global"
              textToRead="Welcome to Maths Master for Primary 5, Primary 6, and Primary 7 pupils. Select any topic to study step-by-step worked examples, key rules, and practice questions."
              title="Audio Player & Controller"
              isGlobal={true}
              size="sm"
            />
          </div>
        </div>

        {/* Year Level Filter Pill Bar */}
        <div
          className="w-full max-w-full overflow-x-auto no-scrollbar flex items-center gap-1.5 py-2 border-t text-xs"
          style={{ borderColor: 'var(--border-card)' }}
        >
          <span className="font-extrabold text-[11px] uppercase tracking-wider mr-1 shrink-0" style={{ color: 'var(--text-muted)' }}>
            Level:
          </span>
          {yearOptions.map((lvl) => {
            const isSelected = selectedYear === lvl;
            const count = lvl === 'All'
              ? mathTopics.length
              : mathTopics.filter((t) => t.yearLevel === lvl).length;
            const cleanName = lvl === 'All'
              ? 'All Levels'
              : lvl.replace(' (Age 9-10)', '').replace(' (Age 10-11)', '').replace(' (Age 11-12)', '').replace(' (Age 12+)', '');

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onSelectYear(lvl)}
                className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border flex items-center gap-1.5 shrink-0"
                style={{
                  backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                }}
              >
                <span>{cleanName}</span>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--border-card)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
