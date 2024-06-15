import { useEffect, useRef, useState } from 'react';
import Suggestion from './Suggestion';
import { Action, SuggestionData } from '../../Command/interfaces';

interface SuggestionContainerProps {
  suggestions: SuggestionData[];
  actionHandler: (action: Action) => void;
}

function SuggestionsContainer({
  suggestions,
  actionHandler,
}: SuggestionContainerProps) {
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(0);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFocusedSuggestionIndex(0);
  }, [suggestions]);

  useEffect(() => {
    if (suggestionsRef.current && focusedSuggestionIndex > 7) {
      suggestionsRef.current.scrollTop = 58 * (focusedSuggestionIndex - 7);
    } else if (suggestionsRef.current) {
      suggestionsRef.current.scrollTop = 0;
    }
  }, [focusedSuggestionIndex]);

  useEffect(() => {
    const moveFocusedIndex = (direction: 'up' | 'down') => {
      if (direction === 'up') {
        setFocusedSuggestionIndex((prevIndex) =>
          prevIndex === 0 ? suggestions.length - 1 : prevIndex - 1,
        );
      } else {
        setFocusedSuggestionIndex((prevIndex) =>
          prevIndex === suggestions.length - 1 ? 0 : prevIndex + 1,
        );
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' || event.key === 'ArrowDown') {
        event.preventDefault();
        moveFocusedIndex('down');
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveFocusedIndex('up');
      }
      if (event.key === 'Enter' && suggestions.length > 0) {
        if (suggestions[focusedSuggestionIndex].action) {
          actionHandler(suggestions[focusedSuggestionIndex].action!);
        }
      }
    };

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown);

    // Remove the event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actionHandler, focusedSuggestionIndex, suggestions]);

  const suggestionElements = suggestions.map((suggestion, index) => (
    <Suggestion
      key={suggestion.id}
      suggestion={suggestion}
      isFocused={index === focusedSuggestionIndex}
      handleAction={() => {
        if (suggestion.action) {
          actionHandler(suggestion.action);
        }
      }}
    />
  ));

  return (
    <div
      ref={suggestionsRef}
      style={{ height: Math.min(suggestions.length, 8) * 58 }}
      className="suggestions-wrapper"
    >
      {suggestionElements}
    </div>
  );
}

export default SuggestionsContainer;
