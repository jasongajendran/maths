import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Subtitles,
  Maximize2,
  Minimize2,
  Bookmark,
  CheckCircle2,
  List,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Sliders,
} from 'lucide-react';
import { fractionsMasterclassLesson, VideoChapter } from '../../data/videoLessons/fractionsLessonData';
import { TeacherAvatar } from './TeacherAvatar';
import { WhiteboardVisuals } from './WhiteboardVisuals';
import { audioSpeech } from '../../utils/audioSpeech';

interface VideoTutoringClipProps {
  onGoToAssessment?: () => void;
  onGoToTheory?: () => void;
}

export const VideoTutoringClip: React.FC<VideoTutoringClipProps> = ({
  onGoToAssessment,
  onGoToTheory,
}) => {
  const lesson = fractionsMasterclassLesson;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [hasVoiceAudio, setHasVoiceAudio] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showChaptersDrawer, setShowChaptersDrawer] = useState(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);

  // Checkpoint Quiz State
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const transcriptListRef = useRef<HTMLDivElement>(null);
  const seekDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync fullscreen state with native document events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFs = !!document.fullscreenElement;
      setIsFullscreen(isDocFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Compute active chapter based on currentTime
  const currentChapterIndex = lesson.chapters.findIndex((chap, idx) => {
    const nextChap = lesson.chapters[idx + 1];
    if (!nextChap) return true;
    return currentTime >= chap.startTime && currentTime < nextChap.startTime;
  });

  const activeChapter: VideoChapter =
    lesson.chapters[currentChapterIndex !== -1 ? currentChapterIndex : 0];

  // Compute active caption index within activeChapter
  const activeCaptionIndex = activeChapter.captions.reduce((bestIdx, curr, idx) => {
    if (currentTime >= curr.time) {
      return idx;
    }
    return bestIdx;
  }, 0);

  const currentCaptionObj = activeChapter.captions[activeCaptionIndex];
  const currentCaption = currentCaptionObj?.text || '';

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to trigger voice reading from a specific caption index within a chapter
  const speakFromCaption = (
    chapter: VideoChapter,
    captionIndex: number,
    rate: number = playbackRate,
    force: boolean = true
  ) => {
    if (!hasVoiceAudio) return;
    const remaining = chapter.captions.slice(captionIndex);
    const textToSpeak = remaining.length > 0
      ? remaining.map(c => c.spokenText || c.text).join(' ')
      : chapter.teacherSpokenScript;

    // Use a unique session key so seeking within the same caption or chapter starts smoothly
    const speakId = `video-clip-${chapter.id}-${captionIndex}-${Date.now()}`;

    audioSpeech.speak(
      speakId,
      textToSpeak,
      {
        rate,
        label: `Mrs. Davies: ${chapter.title}`,
        forcePlay: force,
      }
    );
  };

  // Track chapter transition during playback
  const lastChapterIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isPlaying && hasVoiceAudio) {
      if (lastChapterIdRef.current !== activeChapter.id) {
        lastChapterIdRef.current = activeChapter.id;
        speakFromCaption(activeChapter, activeCaptionIndex, playbackRate, true);
      }
    } else {
      if (!isPlaying) {
        audioSpeech.stop();
      }
    }
  }, [isPlaying, activeChapter.id, hasVoiceAudio, playbackRate]);

  // Playback timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= lesson.totalDuration) {
            setIsPlaying(false);
            audioSpeech.stop();
            return lesson.totalDuration;
          }
          return next;
        });
      }, 1000 / playbackRate);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackRate, lesson.totalDuration]);

  // Clean up audio speech and timers on unmount
  useEffect(() => {
    return () => {
      if (seekDebounceRef.current) clearTimeout(seekDebounceRef.current);
      audioSpeech.stop();
    };
  }, []);

  // Handlers
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioSpeech.stop();
    } else {
      setIsPlaying(true);
      if (hasVoiceAudio) {
        speakFromCaption(activeChapter, activeCaptionIndex, playbackRate, true);
        lastChapterIdRef.current = activeChapter.id;
      }
    }
  };

  const handleSeek = (newTime: number, immediateAudio: boolean = false) => {
    const clamped = Math.max(0, Math.min(lesson.totalDuration, newTime));
    setCurrentTime(clamped);

    const targetChap = lesson.chapters.find((chap, idx) => {
      const nextChap = lesson.chapters[idx + 1];
      if (!nextChap) return true;
      return clamped >= chap.startTime && clamped < nextChap.startTime;
    }) || activeChapter;

    const targetCapIdx = targetChap.captions.reduce((bestIdx, curr, idx) => {
      if (clamped >= curr.time) {
        return idx;
      }
      return bestIdx;
    }, 0);

    lastChapterIdRef.current = targetChap.id;

    if (isPlaying && hasVoiceAudio) {
      if (immediateAudio) {
        if (seekDebounceRef.current) clearTimeout(seekDebounceRef.current);
        speakFromCaption(targetChap, targetCapIdx, playbackRate, true);
      } else {
        // Debounce continuous slider scrub so browser TTS isn't overloaded
        if (seekDebounceRef.current) clearTimeout(seekDebounceRef.current);
        seekDebounceRef.current = setTimeout(() => {
          speakFromCaption(targetChap, targetCapIdx, playbackRate, true);
        }, 90);
      }
    }
  };

  const handleSkip = (seconds: number) => {
    handleSeek(currentTime + seconds, true);
  };

  const handleJumpToChapter = (chapter: VideoChapter) => {
    handleSeek(chapter.startTime, true);
    if (!isPlaying) {
      setIsPlaying(true);
      if (hasVoiceAudio) {
        speakFromCaption(chapter, 0, playbackRate, true);
      }
    }
  };

  const handleJumpToCaption = (targetTime: number) => {
    handleSeek(targetTime, true);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handleCheckpointAnswer = (isCorrect: boolean, feedback: string) => {
    setQuizResult({ isCorrect, feedback });
    if (hasVoiceAudio) {
      audioSpeech.speak(
        `video-quiz-feedback-${Date.now()}`,
        isCorrect
          ? "Superb! Spot on, mathematician! You avoided the trap. The common denominator for 4 and 3 is 12. 1 quarter is 3 twelfths, and 2 thirds is 8 twelfths. 3 plus 8 is 11 twelfths! Brilliant!"
          : "Watch out! You fell into the classic pizza trap! You cannot add the denominators 4 and 3 together. Denominators tell us slice size. Find the common denominator 12 first!",
        { rate: playbackRate, label: 'Teacher Feedback', forcePlay: true }
      );
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch (err) {
      // Fallback state toggle if fullscreen API fails in embedded iframe
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <div
      ref={containerRef}
      id="video-tutoring-player-container"
      className={
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none border-0 h-screen w-screen overflow-y-auto flex flex-col bg-[var(--bg-card)] text-[var(--text-primary)] shadow-none"
          : "rounded-3xl border shadow-lg overflow-hidden flex flex-col transition-all relative"
      }
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-card-strong)',
      }}
    >
      {/* Top Video Stage Bar */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between gap-3 text-xs sm:text-sm font-bold select-none sticky top-0 z-30"
        style={{
          backgroundColor: 'var(--bg-card-subtle)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <span className="uppercase tracking-wider text-[11px] font-extrabold text-amber-600 dark:text-amber-400 shrink-0">
            Interactive Classroom Video Clip
          </span>
          <span className="text-stone-300 dark:text-stone-700">|</span>
          <span className="truncate font-semibold text-xs" style={{ color: 'var(--text-secondary)' }}>
            Scene {activeChapter.chapterNumber} of {lesson.chapters.length}: {activeChapter.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Scene Jump Dropdown for Instant Selection */}
          <select
            value={activeChapter.id}
            onChange={(e) => {
              const chap = lesson.chapters.find((c) => c.id === e.target.value);
              if (chap) handleJumpToChapter(chap);
            }}
            className="hidden md:inline-block px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-card)',
            }}
            title="Quick Chapter Jump"
          >
            {lesson.chapters.map((c) => (
              <option key={c.id} value={c.id}>
                Scene {c.chapterNumber}: {c.title} ({formatTime(c.startTime)})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setShowTranscriptDrawer(!showTranscriptDrawer);
              setShowChaptersDrawer(false);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 hover:opacity-90"
            style={{
              backgroundColor: showTranscriptDrawer ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: showTranscriptDrawer ? 'var(--accent-contrast)' : 'var(--text-primary)',
              borderColor: 'var(--border-card)',
            }}
            title="Toggle live synchronized transcript"
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">Transcript</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowChaptersDrawer(!showChaptersDrawer);
              setShowTranscriptDrawer(false);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 hover:opacity-90"
            style={{
              backgroundColor: showChaptersDrawer ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: showChaptersDrawer ? 'var(--accent-contrast)' : 'var(--text-primary)',
              borderColor: 'var(--border-card)',
            }}
            title="Toggle chapter list"
          >
            <List size={13} />
            <span className="hidden sm:inline">Chapters ({lesson.chapters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 hover:opacity-90"
            style={{
              backgroundColor: isControlsCollapsed ? 'var(--bg-card)' : 'var(--accent-primary)',
              color: isControlsCollapsed ? 'var(--text-secondary)' : 'var(--accent-contrast)',
              borderColor: 'var(--border-card)',
            }}
            title={isControlsCollapsed ? 'Expand Seek Bar & Controls' : 'Collapse Seek Bar'}
          >
            <Sliders size={13} />
            <span className="hidden md:inline">{isControlsCollapsed ? 'Show Controls' : 'Hide Bar'}</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs hover:opacity-90"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-card)',
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Video'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Chapters Overlay Modal / Drawer (High Z-Index, Guaranteed Visible in Fullscreen) */}
      {showChaptersDrawer && (
        <div
          className="p-4 sm:p-6 border-b space-y-4 animate-fadeIn select-none z-40 relative shadow-xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card-strong)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List size={16} className="text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Classroom Lesson Index ({lesson.chapters.length} Scenes)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowChaptersDrawer(false)}
              className="text-xs font-bold px-3 py-1 rounded-lg border cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderColor: 'var(--border-card)',
              }}
            >
              ✕ Close Index
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {lesson.chapters.map((chap) => {
              const isActive = chap.id === activeChapter.id;
              return (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => {
                    handleJumpToChapter(chap);
                    setShowChaptersDrawer(false);
                  }}
                  className={`p-3 rounded-xl border text-left font-semibold text-xs transition-all cursor-pointer shadow-2xs hover:scale-101 flex flex-col justify-between gap-2 ${
                    isActive ? 'ring-2 ring-amber-500 font-bold' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--reading-highlight-bg)' : 'var(--bg-card-subtle)',
                    borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-card)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] font-extrabold">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px]"
                      style={{
                        backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-card)',
                        color: isActive ? 'var(--accent-contrast)' : 'var(--text-secondary)',
                      }}
                    >
                      Scene {chap.chapterNumber}
                    </span>
                    <span className="font-mono text-stone-500">{formatTime(chap.startTime)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-snug">{chap.title}</p>
                    <p className="text-[11px] font-normal mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                      {chap.subtitle}
                    </p>
                  </div>
                  {isActive && (
                    <div className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      Now Playing
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Synchronized Transcript Drawer */}
      {showTranscriptDrawer && (
        <div
          className="p-4 border-b space-y-3 animate-fadeIn select-none z-40 relative shadow-xl"
          style={{
            backgroundColor: 'var(--bg-card-subtle)',
            borderColor: 'var(--border-card)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Live Speech Transcript (Click any line to seek & play audio)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowTranscriptDrawer(false)}
              className="text-xs font-bold px-3 py-1 rounded-lg border cursor-pointer hover:opacity-80"
              style={{ borderColor: 'var(--border-card)' }}
            >
              ✕ Close
            </button>
          </div>

          <div
            ref={transcriptListRef}
            className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-xs"
          >
            {activeChapter.captions.map((cap, idx) => {
              const isCurrent = idx === activeCaptionIndex;
              return (
                <div
                  key={cap.id}
                  onClick={() => handleJumpToCaption(cap.time)}
                  className={`p-2.5 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                    isCurrent
                      ? 'ring-2 ring-amber-500 font-bold shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
                  }`}
                  style={{
                    backgroundColor: isCurrent ? 'var(--reading-highlight-bg)' : 'var(--bg-card)',
                    borderColor: isCurrent ? 'var(--accent-primary)' : 'var(--border-card)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded border font-semibold shrink-0"
                      style={{
                        backgroundColor: 'var(--bg-card-subtle)',
                        borderColor: 'var(--border-card)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {formatTime(cap.time)}
                    </span>
                    <span className="leading-snug">{cap.text}</span>
                  </div>

                  {isCurrent && isPlaying && (
                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      Speaking
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Video Body (Teacher & Smartboard Stage) */}
      <div className="p-4 sm:p-6 space-y-4 relative flex-1 flex flex-col justify-between min-h-[360px]">
        {/* Animated Teacher Avatar Banner */}
        <TeacherAvatar
          name={lesson.teacherName}
          role={lesson.teacherRole}
          mood={activeChapter.teacherMood}
          pose={activeChapter.teacherPose}
          isSpeaking={isPlaying}
          teacherQuote={activeChapter.teacherSpokenScript}
          activeCaptionText={currentCaption}
          hasAudioVoice={hasVoiceAudio}
          onToggleVoice={() => {
            setHasVoiceAudio(!hasVoiceAudio);
            if (hasVoiceAudio) audioSpeech.stop();
          }}
        />

        {/* Dynamic Classroom Whiteboard Screen */}
        <div
          id="classroom-whiteboard-stage"
          className="rounded-2xl border p-4 sm:p-6 shadow-inner relative overflow-hidden transition-all flex-1 min-h-[300px] flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderColor: 'var(--border-card)',
          }}
        >
          {/* Smartboard Canvas Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Whiteboard Content with live time sync */}
          <div className="relative z-10 flex-1">
            <WhiteboardVisuals
              chapter={activeChapter}
              currentTime={currentTime}
              activeCaptionIndex={activeCaptionIndex}
              isPlaying={isPlaying}
              onCheckpointAnswer={handleCheckpointAnswer}
              selectedQuizOption={selectedQuizOption}
              quizResult={quizResult}
            />
          </div>

          {/* Real-time Subtitles / Karaoke Captions Bar */}
          {showCaptions && (
            <div
              className="mt-4 p-2.5 sm:p-3 rounded-xl border text-center relative z-10 transition-all shadow-xs"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span className="text-amber-400 font-extrabold uppercase text-[10px] tracking-wider shrink-0">
                  Captions:
                </span>
                <p className="leading-snug">"{currentCaption}"</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Controls Bar (Collapsible / Expandable) */}
      {isControlsCollapsed ? (
        /* Collapsed Compact Dock */
        <div
          className="p-2 sm:px-4 sm:py-2.5 border-t select-none sticky bottom-0 z-30 transition-all flex items-center justify-between gap-2 shadow-lg backdrop-blur-md"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card-strong)',
          }}
        >
          {/* Left: Quick Play & Time */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="h-8 px-3 rounded-lg font-extrabold text-xs border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              style={{
                backgroundColor: 'var(--accent-primary)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-contrast)',
              }}
              title={isPlaying ? 'Pause Video' : 'Play Video'}
            >
              {isPlaying ? <Pause size={13} className="fill-current" /> : <Play size={13} className="fill-current ml-0.5" />}
              <span className="hidden xs:inline">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <span className="font-mono text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatTime(currentTime)} <span className="opacity-50 font-normal">/ {formatTime(lesson.totalDuration)}</span>
            </span>
          </div>

          {/* Center: Slim Scrubbable Progress Line */}
          <div className="flex-1 max-w-xl mx-1 sm:mx-3 flex items-center gap-2 group cursor-pointer relative">
            <div className="relative w-full h-3 flex items-center">
              <div className="absolute inset-x-0 h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden pointer-events-none">
                {lesson.chapters.map((ch) => (
                  <div
                    key={ch.id}
                    className="absolute top-0 bottom-0 w-0.5 bg-stone-400 dark:bg-stone-600 opacity-60"
                    style={{ left: `${(ch.startTime / lesson.totalDuration) * 100}%` }}
                  />
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={lesson.totalDuration}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value), false)}
                onPointerUp={(e) => handleSeek(Number((e.target as HTMLInputElement).value), true)}
                onTouchEnd={(e) => handleSeek(Number((e.target as HTMLInputElement).value), true)}
                onKeyUp={() => handleSeek(currentTime, true)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-amber-600 dark:accent-amber-400 bg-transparent relative z-10"
                title="Scrub timeline (Click anywhere to seek)"
              />
            </div>
            <span className="hidden md:inline text-[11px] font-extrabold text-amber-600 dark:text-amber-400 shrink-0">
              Scene {activeChapter.chapterNumber}
            </span>
          </div>

          {/* Right: Quick Narration Toggle & Expand Controls Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextState = !hasVoiceAudio;
                setHasVoiceAudio(nextState);
                if (!nextState) {
                  audioSpeech.stop();
                } else if (isPlaying) {
                  speakFromCaption(activeChapter, activeCaptionIndex, playbackRate, true);
                }
              }}
              className="p-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs hover:opacity-90"
              style={{
                backgroundColor: hasVoiceAudio ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                color: hasVoiceAudio ? 'var(--accent-contrast)' : 'var(--text-primary)',
                borderColor: hasVoiceAudio ? 'var(--accent-primary)' : 'var(--border-card)',
              }}
              title={hasVoiceAudio ? 'Voice Narration ON' : 'Voice Narration Muted'}
            >
              {hasVoiceAudio ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>

            <button
              type="button"
              onClick={() => setIsControlsCollapsed(false)}
              className="px-2.5 py-1.5 rounded-lg font-bold text-xs border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:opacity-90"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-primary)',
              }}
              title="Expand full seek bar and playback controls"
            >
              <ChevronUp size={14} />
              <span className="hidden sm:inline">Expand Bar</span>
            </button>
          </div>
        </div>
      ) : (
        /* Full Expanded Controls Bar */
        <div
          className="p-4 border-t space-y-3 select-none sticky bottom-0 z-30 transition-all shadow-md"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          {/* Scrubbable Timeline Progress Bar with Scene Markers */}
          <div className="space-y-1">
            <div className="relative w-full h-4 flex items-center group cursor-pointer">
              {/* Background track with chapter divider ticks */}
              <div className="absolute inset-x-0 h-2 rounded-lg bg-stone-200 dark:bg-stone-800 overflow-hidden pointer-events-none">
                {lesson.chapters.map((ch) => (
                  <div
                    key={ch.id}
                    className="absolute top-0 bottom-0 w-0.5 bg-stone-400 dark:bg-stone-600 opacity-60"
                    style={{ left: `${(ch.startTime / lesson.totalDuration) * 100}%` }}
                  />
                ))}
              </div>

              <input
                type="range"
                min={0}
                max={lesson.totalDuration}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value), false)}
                onPointerUp={(e) => handleSeek(Number((e.target as HTMLInputElement).value), true)}
                onTouchEnd={(e) => handleSeek(Number((e.target as HTMLInputElement).value), true)}
                onKeyUp={() => handleSeek(currentTime, true)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-600 dark:accent-amber-400 bg-transparent relative z-10"
              />
            </div>

            {/* Time & Chapter Progress Indicators */}
            <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                  {formatTime(currentTime)}
                </span>
                <span>/</span>
                <span className="font-mono">{formatTime(lesson.totalDuration)}</span>
              </div>

              <span className="hidden sm:inline font-semibold truncate max-w-xs">
                {activeChapter.subtitle}
              </span>

              <span className="text-[10px] uppercase tracking-wider font-extrabold" style={{ color: 'var(--accent-primary)' }}>
                {Math.round((currentTime / lesson.totalDuration) * 100)}% Complete
              </span>
            </div>
          </div>

          {/* Control Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Playback Transport Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Prev Chapter */}
              <button
                type="button"
                onClick={() => {
                  const prevIndex = Math.max(0, currentChapterIndex - 1);
                  handleJumpToChapter(lesson.chapters[prevIndex]);
                }}
                disabled={currentChapterIndex === 0}
                className="p-2 rounded-xl border transition-all cursor-pointer shadow-2xs disabled:opacity-40 hover:opacity-90"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}
                title="Previous Chapter"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Skip -10s */}
              <button
                type="button"
                onClick={() => handleSkip(-10)}
                className="p-2 rounded-xl border transition-all cursor-pointer shadow-2xs hover:opacity-90"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}
                title="Rewind 10 seconds"
              >
                <RotateCcw size={15} />
              </button>

              {/* Play / Pause Primary Button */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className="h-10 px-4 rounded-xl font-extrabold text-sm border flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  borderColor: 'var(--accent-primary)',
                  color: 'var(--accent-contrast)',
                }}
                title={isPlaying ? 'Pause Video' : 'Play Video Clip'}
              >
                {isPlaying ? <Pause size={17} className="fill-current" /> : <Play size={17} className="fill-current ml-0.5" />}
                <span>{isPlaying ? 'Pause' : 'Play Lesson'}</span>
              </button>

              {/* Skip +10s */}
              <button
                type="button"
                onClick={() => handleSkip(10)}
                className="p-2 rounded-xl border transition-all cursor-pointer shadow-2xs hover:opacity-90"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}
                title="Skip forward 10 seconds"
              >
                <SkipForward size={15} />
              </button>

              {/* Next Chapter */}
              <button
                type="button"
                onClick={() => {
                  const nextIndex = Math.min(lesson.chapters.length - 1, currentChapterIndex + 1);
                  handleJumpToChapter(lesson.chapters[nextIndex]);
                }}
                disabled={currentChapterIndex === lesson.chapters.length - 1}
                className="p-2 rounded-xl border transition-all cursor-pointer shadow-2xs disabled:opacity-40 hover:opacity-90"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}
                title="Next Chapter"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Right Controls: Speed, Captions, Narration & Collapse Button */}
            <div className="flex items-center gap-2">
              {/* Speed Selector */}
              <div className="flex items-center rounded-lg border overflow-hidden shadow-2xs text-xs font-bold"
                style={{ borderColor: 'var(--border-card)' }}>
                {[0.75, 1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaybackRate(speed)}
                    className="px-2 py-1 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: playbackRate === speed ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: playbackRate === speed ? 'var(--accent-contrast)' : 'var(--text-muted)',
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Captions Toggle */}
              <button
                type="button"
                onClick={() => setShowCaptions(!showCaptions)}
                className="p-2 rounded-xl border transition-all cursor-pointer shadow-2xs hover:opacity-90"
                style={{
                  backgroundColor: showCaptions ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  color: showCaptions ? 'var(--accent-contrast)' : 'var(--text-primary)',
                  borderColor: showCaptions ? 'var(--accent-primary)' : 'var(--border-card)',
                }}
                title={showCaptions ? 'Captions ON' : 'Captions OFF'}
              >
                <Subtitles size={15} />
              </button>

              {/* Voice Audio Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !hasVoiceAudio;
                  setHasVoiceAudio(nextState);
                  if (!nextState) {
                    audioSpeech.stop();
                  } else if (isPlaying) {
                    speakFromCaption(activeChapter, activeCaptionIndex, playbackRate, true);
                  }
                }}
                className="p-2 rounded-xl border transition-all cursor-pointer shadow-2xs hover:opacity-90"
                style={{
                  backgroundColor: hasVoiceAudio ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  color: hasVoiceAudio ? 'var(--accent-contrast)' : 'var(--text-primary)',
                  borderColor: hasVoiceAudio ? 'var(--accent-primary)' : 'var(--border-card)',
                }}
                title={hasVoiceAudio ? 'Voice Narration ON' : 'Voice Narration Muted'}
              >
                {hasVoiceAudio ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              {/* Collapse Seek Bar Button */}
              <button
                type="button"
                onClick={() => setIsControlsCollapsed(true)}
                className="p-2 rounded-xl border transition-all cursor-pointer shadow-2xs hover:opacity-90 flex items-center gap-1 text-xs font-bold"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-secondary)',
                }}
                title="Collapse seek bar to maximize chalkboard view"
              >
                <ChevronDown size={15} />
                <span className="hidden sm:inline">Hide Bar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classroom Quick Links & Next Steps Footer */}
      <div
        className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        style={{
          backgroundColor: 'var(--bg-card-subtle)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="flex items-center gap-2">
          <Bookmark size={14} className="text-amber-600 dark:text-amber-400" />
          <span className="font-bold">Next Recommended Activity:</span>
          <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Take the 25-Question Fractions Syllabus Assessment
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onGoToTheory && (
            <button
              type="button"
              onClick={onGoToTheory}
              className="px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer shadow-2xs hover:opacity-90 flex items-center gap-1.5"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-card)',
              }}
            >
              <BookOpen size={13} />
              <span>Revision Notes</span>
            </button>
          )}

          {onGoToAssessment && (
            <button
              type="button"
              onClick={onGoToAssessment}
              className="px-3.5 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
              style={{
                backgroundColor: 'var(--accent-primary)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-contrast)',
              }}
            >
              <Award size={13} />
              <span>Start 25 Qs Assessment</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
