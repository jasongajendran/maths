import React from 'react';
import {
  Layers,
  PieChart,
  Calculator,
  Hash,
  Triangle,
  Maximize2,
  BarChart2,
  ChevronRight,
  X,
  PanelLeftClose,
} from 'lucide-react';
import { MathTopic, CategoryId } from '../types/math';

interface SidebarProps {
  topics: MathTopic[];
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (cat: CategoryId | 'all') => void;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  isDesktopOpen?: boolean;
  onToggleDesktop?: () => void;
}

const categoryMeta: Record<
  CategoryId | 'all',
  { name: string; icon: React.FC<{ size?: number; className?: string }> }
> = {
  all: { name: 'All Areas', icon: Layers },
  fractions: { name: 'Fractions & %', icon: PieChart },
  calculations: { name: 'BODMAS & Times', icon: Calculator },
  numbers: { name: 'Place Value & Roman', icon: Hash },
  geometry: { name: 'Angles & Shapes', icon: Triangle },
  measurement: { name: 'Area & Perimeter', icon: Maximize2 },
  data: { name: 'Averages & Data', icon: BarChart2 },
};

export const Sidebar: React.FC<SidebarProps> = ({
  topics,
  selectedTopicId,
  onSelectTopic,
  selectedCategory,
  onSelectCategory,
  isOpenOnMobile,
  onCloseMobile,
  isDesktopOpen = true,
  onToggleDesktop,
}) => {
  const categories: (CategoryId | 'all')[] = [
    'all',
    'fractions',
    'calculations',
    'numbers',
    'geometry',
    'measurement',
    'data',
  ];

  const handleTopicClick = (id: string) => {
    onSelectTopic(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Navigation Drawer (mobile) / Sticky Column (desktop & tablet landscape) */}
      <aside
        id="topic-navigator-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${
          isOpenOnMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${
          isDesktopOpen
            ? 'lg:translate-x-0 lg:static lg:z-10 lg:w-72 xl:w-80 lg:h-[calc(100vh-6.5rem)] lg:rounded-2xl lg:border lg:sticky lg:top-20 shrink-0'
            : 'lg:hidden'
        }`}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card-strong)',
        }}
      >
        {/* Header bar with Collapse/Close Button (Mobile, Tablet Landscape & Desktop) */}
        <div
          className="flex items-center justify-between p-3.5 border-b shrink-0"
          style={{
            borderColor: 'var(--border-card)',
            backgroundColor: 'var(--bg-card-subtle)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-extrabold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              Topic Navigator
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0"
              style={{
                backgroundColor: 'var(--badge-bg)',
                color: 'var(--badge-text)',
                borderColor: 'var(--border-card-strong)',
              }}
            >
              {topics.length}
            </span>
          </div>
          <button
            id="sidebar-collapse-btn"
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                if (onToggleDesktop) onToggleDesktop();
              } else {
                onCloseMobile();
              }
            }}
            className="p-1 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
            style={{
              borderColor: 'var(--border-card)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-card)',
            }}
            aria-label="Collapse Menu"
            title="Collapse Menu"
          >
            <X size={17} className="lg:hidden" />
            <PanelLeftClose size={17} className="hidden lg:block" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="p-3 border-b" style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-card-subtle)' }}>
          <span className="text-[11px] font-extrabold uppercase tracking-wider block mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
            Subject Area
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((catKey) => {
              const meta = categoryMeta[catKey];
              const Icon = meta.icon;
              const isSelected = selectedCategory === catKey;

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => onSelectCategory(catKey)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer border shadow-2xs"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-card)',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card)',
                    color: isSelected ? 'var(--accent-contrast)' : 'var(--text-primary)',
                  }}
                >
                  <Icon size={13} style={{ color: isSelected ? 'var(--accent-contrast)' : 'var(--accent-primary)' }} />
                  <span className="truncate">{meta.name.replace(' & ', ' ')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 p-2.5 space-y-1 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            <span>Topics ({topics.length})</span>
          </div>

          {topics.length === 0 ? (
            <div className="p-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              No matching mathematics topics found.
            </div>
          ) : (
            topics.map((t) => {
              const isSelected = t.id === selectedTopicId;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTopicClick(t.id)}
                  className="w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-2 border"
                  style={{
                    backgroundColor: isSelected ? 'var(--reading-highlight-bg)' : 'transparent',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                    boxShadow: isSelected ? '0 1px 4px 0 rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border"
                        style={{
                          backgroundColor: 'var(--bg-card-subtle)',
                          borderColor: 'var(--border-card)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {t.yearLevel.replace(' (Age 9-10)', '').replace(' (Age 10-11)', '').replace(' (Age 11-12)', '').replace(' (Age 12+)', '')}
                      </span>
                      {t.toolType && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: 'var(--badge-bg)',
                            color: 'var(--badge-text)',
                            borderColor: 'var(--border-card-strong)',
                          }}
                        >
                          Tool
                        </span>
                      )}
                    </div>

                    <h4
                      className="text-xs sm:text-sm font-bold leading-snug line-clamp-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t.title}
                    </h4>

                    <p className="text-[11px] line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                      {t.summary}
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="shrink-0 mt-1.5 transition-transform"
                    style={{
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                      transform: isSelected ? 'translateX(2px)' : 'none',
                    }}
                  />
                </button>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
