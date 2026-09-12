import React, { useState } from 'react';
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
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Video,
} from 'lucide-react';
import { MathTopic, CategoryId } from '../types/math';
import { allAssessments, getAssessmentForTopic } from '../data/assessments';
import { getAssessmentRecord } from '../utils/assessmentStorage';

export interface SidebarProps {
  topics: MathTopic[];
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (cat: CategoryId | 'all') => void;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  isDesktopOpen?: boolean;
  onToggleDesktop?: () => void;
  activeMode?: 'learn' | 'assessment';
  onSelectMode?: (mode: 'learn' | 'assessment') => void;
  onOpenAssessment?: (topicId: string) => void;
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
  activeMode = 'learn',
  onSelectMode,
  onOpenAssessment,
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

  const checkIsTabletLandscapeOrDesktop = () => {
    if (typeof window === 'undefined') return false;
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    return window.innerWidth >= 1024 || (window.innerWidth >= 768 && isLandscape);
  };

  const handleCollapseClick = () => {
    if (checkIsTabletLandscapeOrDesktop()) {
      if (onToggleDesktop) {
        onToggleDesktop();
      } else {
        onCloseMobile();
      }
    } else {
      onCloseMobile();
    }
  };

  const handleTopicClick = (id: string) => {
    onSelectTopic(id);
    if (onSelectMode && activeMode !== 'learn') {
      onSelectMode('learn');
    }
    onCloseMobile();
  };

  const handleAssessmentClick = (topicId: string) => {
    if (onOpenAssessment) {
      onOpenAssessment(topicId);
    } else {
      onSelectTopic(topicId);
    }
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
              {activeMode === 'assessment' ? allAssessments.length : topics.length}
            </span>
          </div>

          <button
            id="sidebar-collapse-btn"
            type="button"
            onClick={handleCollapseClick}
            className="p-1 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
            style={{
              borderColor: 'var(--border-card)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-card)',
            }}
            aria-label="Collapse Navigation Menu"
            title="Collapse Menu"
          >
            <PanelLeftClose size={17} />
          </button>
        </div>

        {/* Dedicated Section Navigation Tabs (Topics & Study vs 25-Question Assessments) */}
        <div className="p-2 border-b shrink-0" style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-card-subtle)' }}>
          <div className="grid grid-cols-2 p-1 rounded-xl border bg-black/5 gap-1" style={{ borderColor: 'var(--border-card)' }}>
            <button
              type="button"
              id="sidebar-mode-learn-btn"
              onClick={() => onSelectMode && onSelectMode('learn')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
              style={{
                backgroundColor: activeMode === 'learn' ? 'var(--accent-primary)' : 'transparent',
                color: activeMode === 'learn' ? 'var(--accent-contrast)' : 'var(--text-secondary)',
              }}
            >
              <BookOpen size={13} />
              <span>Lessons</span>
            </button>

            <button
              type="button"
              id="sidebar-mode-assessment-btn"
              onClick={() => onSelectMode && onSelectMode('assessment')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs relative"
              style={{
                backgroundColor: activeMode === 'assessment' ? 'var(--accent-primary)' : 'transparent',
                color: activeMode === 'assessment' ? 'var(--accent-contrast)' : 'var(--text-secondary)',
              }}
            >
              <Award size={13} />
              <span>Assessments</span>
              <span
                className="text-[9px] font-black px-1 rounded-full uppercase ml-0.5 border"
                style={{
                  backgroundColor: activeMode === 'assessment' ? 'var(--bg-card)' : 'var(--badge-bg)',
                  color: activeMode === 'assessment' ? 'var(--text-primary)' : 'var(--badge-text)',
                  borderColor: 'var(--border-card)',
                }}
              >
                25Q
              </span>
            </button>
          </div>
        </div>

        {/* Mode 1: Topics & Lessons View */}
        {activeMode === 'learn' ? (
          <>
            {/* Category Pills */}
            <div className="p-3 border-b shrink-0" style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-card-subtle)' }}>
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
                  const assessment = getAssessmentForTopic(t.id);

                  return (
                    <div
                      key={t.id}
                      className="w-full rounded-xl transition-all border group tactile-card"
                      style={{
                        backgroundColor: isSelected ? 'var(--reading-highlight-bg)' : 'var(--bg-card-subtle)',
                        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card)',
                        borderLeftWidth: isSelected ? '4px' : '1px',
                        borderLeftColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleTopicClick(t.id)}
                        className="w-full text-left p-2.5 cursor-pointer flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md border"
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-card)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {t.yearLevel.replace(' (Age 9-10)', '').replace(' (Age 10-11)', '').replace(' (Age 11-12)', '').replace(' (Age 12+)', '')}
                            </span>
                            {t.id === 'fractions-mastery' && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1"
                                style={{
                                  backgroundColor: 'var(--contrast-amber-bg)',
                                  color: 'var(--contrast-amber-text)',
                                  borderColor: 'var(--contrast-amber-border)',
                                }}
                              >
                                <Video size={10} className="shrink-0" />
                                <span>Video Lesson</span>
                              </span>
                            )}
                            {t.toolType && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border"
                                style={{
                                  backgroundColor: 'var(--badge-bg)',
                                  color: 'var(--badge-text)',
                                  borderColor: 'var(--border-card-strong)',
                                }}
                              >
                                Interactive Tool
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
                          size={16}
                          className="shrink-0 mt-1 transition-transform"
                          style={{
                            color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                            transform: isSelected ? 'translateX(2px)' : 'none',
                          }}
                        />
                      </button>

                      {/* Direct Assessment Trigger Pill */}
                      {assessment && (
                        <div className="px-2.5 pb-2 pt-0.5 flex justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssessmentClick(t.id);
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                              backgroundColor: 'var(--bg-card)',
                              borderColor: 'var(--border-card-strong)',
                              color: 'var(--accent-primary)',
                            }}
                            title={`Take 25-Question Assessment on ${t.title}`}
                          >
                            <Award size={11} />
                            <span>25Q Assessment</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* Mode 2: Dedicated Assessments List (25 Questions per topic) */
          <div className="flex-1 p-2.5 space-y-1.5 overflow-y-auto">
            <div className="p-2 rounded-xl border mb-2" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
              <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                Topic-by-Topic Assessments
              </span>
              <p className="text-[11px] leading-tight mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Each topic contains 25 syllabus-aligned questions (Foundation → Application → Reasoning) with instant explanations & retakes.
              </p>
            </div>

            {allAssessments.map((item) => {
              const isSelected = item.topicId === selectedTopicId;
              const record = getAssessmentRecord(item.topicId);
              const attemptsCount = Object.keys(record.attempts).length;
              const correctCount = Object.values(record.attempts).filter((a) => a.isCorrect).length;
              const incorrectCount = attemptsCount - correctCount;

              const pct = Math.round((attemptsCount / 25) * 100);

              return (
                <button
                  key={item.topicId}
                  type="button"
                  onClick={() => handleAssessmentClick(item.topicId)}
                  className="w-full text-left p-3 rounded-xl transition-all cursor-pointer border shadow-2xs space-y-2 tactile-card"
                  style={{
                    backgroundColor: isSelected ? 'var(--reading-highlight-bg)' : 'var(--bg-card-subtle)',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card)',
                    borderLeftWidth: isSelected ? '4px' : '1px',
                    borderLeftColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card)',
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-card)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {item.yearLevel.replace('Primary ', 'P').replace(' / Year ', ' / Y').replace(/ \(Age .*\)/, '')}
                    </span>

                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor:
                          attemptsCount === 0
                            ? 'var(--bg-card)'
                            : incorrectCount === 0
                            ? 'var(--contrast-teal-bg)'
                            : 'var(--contrast-amber-bg)',
                        color:
                          attemptsCount === 0
                            ? 'var(--text-muted)'
                            : incorrectCount === 0
                            ? 'var(--contrast-teal)'
                            : 'var(--contrast-amber)',
                        borderColor: 'var(--border-card)',
                      }}
                    >
                      {attemptsCount === 0
                        ? '25 Questions'
                        : `${correctCount} / 25 Correct`}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold leading-snug line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                      {item.topicTitle}
                    </h4>
                    <p className="text-[11px] line-clamp-1 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {item.summary}
                    </p>
                  </div>

                  {/* Progress Bar (Visual completion) */}
                  {attemptsCount > 0 && (
                    <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: incorrectCount === 0 ? 'var(--contrast-teal)' : 'var(--accent-primary)',
                        }}
                      />
                    </div>
                  )}

                  {/* Progress or Review status */}
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t" style={{ borderColor: 'var(--border-card)' }}>
                    <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                      {attemptsCount === 0 ? 'Foundation → Reasoning' : `${pct}% completed`}
                    </span>
                    {incorrectCount > 0 ? (
                      <span className="font-bold flex items-center gap-0.5" style={{ color: 'var(--contrast-warm)' }}>
                        <AlertTriangle size={10} /> {incorrectCount} to retake
                      </span>
                    ) : attemptsCount === 25 ? (
                      <span className="font-bold flex items-center gap-0.5" style={{ color: 'var(--contrast-teal)' }}>
                        <CheckCircle2 size={10} /> Completed!
                      </span>
                    ) : attemptsCount > 0 ? (
                      <span className="font-bold flex items-center gap-0.5" style={{ color: 'var(--accent-primary)' }}>
                        <CheckCircle2 size={10} /> In progress
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Ready to start</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>
    </>
  );
};
