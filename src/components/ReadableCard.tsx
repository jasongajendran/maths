import React, { useState, useEffect } from 'react';
import { audioSpeech } from '../utils/audioSpeech';

interface ReadableCardProps {
  id: string;
  textToRead: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  as?: 'div' | 'article' | 'section';
  highlightStyle?: 'full' | 'subtle' | 'inner';
  ariaLabel?: string;
}

export const ReadableCard: React.FC<ReadableCardProps> = ({
  id,
  textToRead,
  children,
  className = '',
  activeClassName = '',
  as: Component = 'div',
  highlightStyle = 'full',
  ariaLabel,
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const unsubscribe = audioSpeech.subscribe((activeId, isSpeaking) => {
      setIsActive(activeId === id && isSpeaking);
    });
    return unsubscribe;
  }, [id]);

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click originated from an interactive element (button, input, slider, link, or elements marked with data-no-speech),
    // let that element handle its own interaction without toggling card audio
    const target = e.target as HTMLElement | null;
    if (target) {
      const interactiveEl = target.closest(
        'button, input, select, textarea, a, summary, [role="button"], [data-no-speech="true"]'
      );
      if (interactiveEl) {
        return;
      }
    }

    if (isActive) {
      audioSpeech.stop();
    } else {
      audioSpeech.speak(id, textToRead);
    }
  };

  const getCardStyle = () => {
    if (isActive) {
      return {
        backgroundColor: 'var(--reading-highlight-bg)',
        borderColor: 'var(--reading-highlight-border)',
        boxShadow: '0 0 0 2.5px var(--reading-highlight-ring), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        color: 'var(--text-primary)',
      };
    }
    if (highlightStyle === 'inner') {
      return {
        backgroundColor: 'var(--bg-card-subtle)',
        borderColor: 'var(--border-card)',
        color: 'var(--text-primary)',
      };
    }
    return {
      backgroundColor: 'var(--bg-card)',
      borderColor: 'var(--border-card)',
      color: 'var(--text-primary)',
    };
  };

  return (
    <Component
      id={`readable-card-${id}`}
      onClick={handleCardClick}
      aria-label={ariaLabel}
      className={`relative rounded-2xl border transition-all duration-200 cursor-pointer ${
        isActive
          ? `z-10 ${activeClassName}`
          : 'hover:border-opacity-100 hover:shadow-xs'
      } ${className}`}
      style={getCardStyle()}
    >
      {children}
    </Component>
  );
};

