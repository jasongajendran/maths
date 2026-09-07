import React, { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { audioSpeech } from '../utils/audioSpeech';

interface AudioButtonProps {
  id: string;
  textToRead: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
  isGlobal?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  id,
  textToRead,
  size = 'md',
  className = '',
  title = 'Read aloud',
  isGlobal = false,
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const unsubscribe = audioSpeech.subscribe((activeId, isSpeaking) => {
      if (isGlobal) {
        setIsActive(isSpeaking);
      } else {
        setIsActive(activeId === id && isSpeaking);
      }
    });
    return unsubscribe;
  }, [id, isGlobal]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      audioSpeech.stop();
    } else {
      audioSpeech.speak(id, textToRead);
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-7 p-1 text-xs',
    md: 'w-8 h-8 p-1.5 text-sm',
    lg: 'w-9 h-9 p-2 text-base',
  };

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 17,
  };

  const currentTitle = isActive ? 'Click to stop reading' : title;

  return (
    <button
      id={`audio-btn-${id}`}
      type="button"
      onClick={handleClick}
      title={currentTitle}
      aria-label={currentTitle}
      className={`inline-flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer shrink-0 border ${sizeClasses[size]} ${
        isActive
          ? 'shadow-xs ring-2 ring-offset-1'
          : 'shadow-2xs hover:scale-105'
      } ${className}`}
      style={{
        backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
        borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-card-strong)',
        color: isActive ? '#ffffff' : 'var(--accent-primary)',
      }}
    >
      {isActive ? (
        <span className="flex items-center justify-center gap-0.5">
          {/* Animated mini sound bars */}
          <span className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          </span>
          <Square size={iconSizes[size] - 3} className="fill-current ml-0.5" />
        </span>
      ) : (
        <Volume2 size={iconSizes[size]} className="transition-transform duration-200" />
      )}
    </button>
  );
};

