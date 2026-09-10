import React, { useState, useMemo } from 'react';
import { PanelLeftOpen } from 'lucide-react';
import { mathTopics } from './data/mathTopics';
import { CategoryId, YearLevel } from './types/math';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TopicDetail } from './components/TopicDetail';
import { QuickFormulaDrawer } from './components/QuickFormulaDrawer';
import { GoToTop } from './components/GoToTop';
import { FloatingAudioController } from './components/FloatingAudioController';

export default function App() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('fractions-mastery');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<YearLevel | 'All'>('All');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isFormulaDrawerOpen, setIsFormulaDrawerOpen] = useState<boolean>(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maths_master_sidebar_open');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const handleToggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('maths_master_sidebar_open', String(next));
        } catch (e) {
          // safe fallback
        }
      }
      return next;
    });
  };

  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);

  // Filter topics based on category and year level
  const filteredTopics = useMemo(() => {
    return mathTopics.filter((t) => {
      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }
      // Year level filter
      if (selectedYear !== 'All' && t.yearLevel !== selectedYear) {
        return false;
      }
      return true;
    });
  }, [selectedCategory, selectedYear]);

  // Current active topic - strictly respects the active filters
  const activeTopic = useMemo(() => {
    // 1. Try finding the selected topic in the currently filtered list
    const inFiltered = filteredTopics.find((t) => t.id === selectedTopicId);
    if (inFiltered) return inFiltered;

    // 2. If current topic is not in the filtered list, pick the first topic in the filtered list
    if (filteredTopics.length > 0) return filteredTopics[0];

    // 3. Fallback: match anywhere in all topics
    return mathTopics.find((t) => t.id === selectedTopicId) || mathTopics[0];
  }, [selectedTopicId, filteredTopics]);

  // Keep selectedTopicId in sync with activeTopic
  React.useEffect(() => {
    if (activeTopic && activeTopic.id !== selectedTopicId) {
      setSelectedTopicId(activeTopic.id);
    }
  }, [activeTopic, selectedTopicId]);

  // Handler for selecting year level from the top band
  const handleSelectYear = (year: YearLevel | 'All') => {
    setSelectedYear(year);

    // If switching to a specific year level, select the first topic belonging to that year
    let matching = mathTopics.filter((t) => {
      if (year !== 'All' && t.yearLevel !== year) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      return true;
    });

    // If current category has no topics for this year, reset category to 'all'
    if (matching.length === 0 && year !== 'All') {
      setSelectedCategory('all');
      matching = mathTopics.filter((t) => t.yearLevel === year);
    }

    if (matching.length > 0) {
      setSelectedTopicId(matching[0].id);
      setTargetSectionId(null);
    }
  };

  // Handler for selecting a topic directly, ensuring filters do not hide the target topic
  const handleSelectTopicDirectly = (id: string, sectionId?: string) => {
    const target = mathTopics.find((t) => t.id === id);
    if (target) {
      if (selectedCategory !== 'all' && target.category !== selectedCategory) {
        setSelectedCategory('all');
      }
      if (selectedYear !== 'All' && target.yearLevel !== selectedYear) {
        setSelectedYear('All');
      }
    }
    setSelectedTopicId(id);
    if (sectionId) {
      setTargetSectionId(sectionId);
    } else {
      setTargetSectionId(null);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Navbar */}
      <Header
        selectedYear={selectedYear}
        onSelectYear={handleSelectYear}
        onOpenFormulaDrawer={() => setIsFormulaDrawerOpen(true)}
        isMobileNavOpen={isMobileNavOpen}
        onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
        isDesktopSidebarOpen={isDesktopSidebarOpen}
        onToggleDesktopSidebar={handleToggleDesktopSidebar}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-32 flex flex-col lg:flex-row gap-6 min-w-0">
        {/* Left Sidebar for Tablets / Desktop */}
        <Sidebar
          topics={filteredTopics}
          selectedTopicId={activeTopic.id}
          onSelectTopic={(id) => {
            setSelectedTopicId(id);
            setTargetSectionId(null);
          }}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isOpenOnMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          isDesktopOpen={isDesktopSidebarOpen}
          onToggleDesktop={handleToggleDesktopSidebar}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full">
          {/* Quick expand pill when menu is collapsed on tablet landscape / desktop */}
          {!isDesktopSidebarOpen && (
            <div className="hidden lg:flex items-center mb-3">
              <button
                id="expand-sidebar-pill-btn"
                type="button"
                onClick={handleToggleDesktopSidebar}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:opacity-90 cursor-pointer shadow-2xs"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-card-strong)',
                  color: 'var(--text-primary)',
                }}
                title="Open topic navigator menu"
                aria-label="Open topic navigator menu"
              >
                <PanelLeftOpen size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Show Topic Navigator ({filteredTopics.length})</span>
              </button>
            </div>
          )}

          <TopicDetail
            topic={activeTopic}
            onSelectTopic={handleSelectTopicDirectly}
            targetSectionId={targetSectionId}
            onClearTargetSection={() => setTargetSectionId(null)}
          />
        </main>
      </div>

      {/* Floating Go To Top Button */}
      <GoToTop />

      {/* Floating Audio Controller whenever speech is active */}
      <FloatingAudioController />

      {/* Quick Formula Sheet Slide-over */}
      <QuickFormulaDrawer
        isOpen={isFormulaDrawerOpen}
        onClose={() => setIsFormulaDrawerOpen(false)}
        onSelectTopic={(id) => {
          handleSelectTopicDirectly(id);
          setIsFormulaDrawerOpen(false);
        }}
      />
    </div>
  );
}
