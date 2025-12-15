import React from "react";
import { useEffect, useRef, useState } from "react";
import SuggestionElement from "./SuggestionElement";
import { Suggestion, SuggestionAction } from "../../types/command";
import { useSpotlightify } from "../../hooks/useSpotlightify";
import OptionsCommand from "../../Command/Commands/options";

interface SuggestionContainerProps {
  suggestions: Suggestion[];
  actionHandler: (action: SuggestionAction) => void;
}

interface VisibleSuggestions {
  startIndex: number;
  endIndex: number;
  focusedIndex: number;
}

function SuggestionsContainer({
  suggestions,
  actionHandler,
}: SuggestionContainerProps) {
  const { actions } = useSpotlightify();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [visibleSuggestions, setVisibleSuggestions] =
    useState<VisibleSuggestions>({
      startIndex: 0,
      endIndex: 0,
      focusedIndex: 0,
    });
  const previousSuggestionIdsRef = useRef<string[]>([]);
  const [isShiftHeld, setIsShiftHeld] = useState(false);

  useEffect(() => {
    const currentSuggestionIds = suggestions.map((s) => s.id);
    const previousSuggestionIds = previousSuggestionIdsRef.current;

    const idsChanged =
      currentSuggestionIds.length !== previousSuggestionIds.length ||
      currentSuggestionIds.some(
        (id, index) => id !== previousSuggestionIds[index]
      );

    if (idsChanged) {
      setVisibleSuggestions({
        startIndex: 0,
        endIndex: Math.min(suggestions.length - 1, 7),
        focusedIndex: 0,
      });
      previousSuggestionIdsRef.current = currentSuggestionIds;
    }
  }, [suggestions]);

  useEffect(() => {
    if (suggestionsRef.current) {
      suggestionsRef.current.scrollTop = 58 * visibleSuggestions.startIndex;
    }
  }, [visibleSuggestions.focusedIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftHeld(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftHeld(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const moveFocusedIndex = (direction: "up" | "down") => {
      const noOfVisibleSuggestions = Math.min(suggestions.length, 8);
      let newFocusedIndex = 0;
      if (direction === "up") {
        newFocusedIndex =
          visibleSuggestions.focusedIndex === 0
            ? suggestions.length - 1
            : visibleSuggestions.focusedIndex - 1;
      } else {
        newFocusedIndex =
          visibleSuggestions.focusedIndex === suggestions.length - 1
            ? 0
            : visibleSuggestions.focusedIndex + 1;
      }

      if (newFocusedIndex > visibleSuggestions.endIndex) {
        const newEndIndex = newFocusedIndex;
        setVisibleSuggestions({
          endIndex: newEndIndex,
          startIndex: newEndIndex - (noOfVisibleSuggestions - 1),
          focusedIndex: newFocusedIndex,
        });
      } else if (newFocusedIndex < visibleSuggestions.startIndex) {
        const newStartIndex = newFocusedIndex;
        setVisibleSuggestions({
          startIndex: newStartIndex,
          endIndex: newStartIndex + (noOfVisibleSuggestions - 1),
          focusedIndex: newFocusedIndex,
        });
      } else {
        setVisibleSuggestions((prevSuggestions) => ({
          ...prevSuggestions,
          focusedIndex: newFocusedIndex,
        }));
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" || event.key === "ArrowDown") {
        event.preventDefault();
        moveFocusedIndex("down");
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        moveFocusedIndex("up");
      }
      if (event.key === "Enter" && suggestions.length > 0) {
        const focusedSuggestion = suggestions[visibleSuggestions.focusedIndex];
        if (event.shiftKey && focusedSuggestion.options) {
          // Push OptionsCommand with the suggestion's options
          actions.setActiveCommand(new OptionsCommand(), {
            data: focusedSuggestion.options,
            placeholderText: `Options for ${focusedSuggestion.title}`,
          });
        } else {
          const action = focusedSuggestion.action;
          if (action) {
            actionHandler(action);
          }
        }
      }
    };

    // Add the event listener
    window.addEventListener("keydown", handleKeyDown);

    // Remove the event listener on cleanup
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actionHandler, visibleSuggestions.focusedIndex, suggestions, actions]);

  const handleSuggestionClick = (
    suggestion: Suggestion,
    event?: React.MouseEvent
  ) => {
    if (event?.shiftKey && suggestion.options) {
      // Push OptionsCommand with the suggestion's options
      actions.setActiveCommand(new OptionsCommand(), {
        data: suggestion.options,
        placeholderText: `Options for ${suggestion.title}`,
      });
    } else {
      if (suggestion.action) {
        actionHandler(suggestion.action);
      }
    }
  };

  const suggestionElements = suggestions.map((suggestion, index) => (
    <SuggestionElement
      key={suggestion.id}
      suggestion={suggestion}
      isFocused={index === visibleSuggestions.focusedIndex}
      isShiftHeld={isShiftHeld}
      handleAction={(event) => handleSuggestionClick(suggestion, event)}
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
