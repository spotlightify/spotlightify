import React from "react";
import { Suggestion } from "../../types/command";
import CommandActionSymbol from "../CommandActionSymbol";
import Icon from "../../types/icons";

interface SuggestionProps {
  suggestion: Suggestion;
  isFocused: boolean;
  isShiftHeld: boolean;
  handleAction: (event?: React.MouseEvent) => void;
}

function SuggestionElement({
  suggestion,
  isFocused = false,
  isShiftHeld = false,
  handleAction,
}: SuggestionProps) {
  const hasOptions = !!suggestion.options;
  const showOptionsIcon = isShiftHeld && hasOptions;

  const displayDescription = suggestion.isLoading
    ? (suggestion.loadingText || suggestion.description)
    : suggestion.description;

  return (
    <button
      type="button"
      className={`suggestion-item ${isFocused ? "button--focus" : ""} ${
        suggestion.isLoading ? "suggestion-item--loading" : ""
      }`}
      onClick={(e) => handleAction(e)}
    >
      <div className="flex justify-between w-full items-center">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-shrink">
          <div className="suggestion-item__icon-wrapper flex-shrink-0">
            <img
              className={`suggestion-item__icon${
                suggestion.icon?.endsWith(".svg") ? "--svg" : ""
              }${suggestion.isLoading ? " opacity-50" : ""}`}
              src={suggestion.icon}
              alt="icon"
            />
          </div>
          <div className="suggestion-text-wrapper min-w-0 overflow-hidden">
            <div className="suggestion-item__title truncate">
              {suggestion.title}
            </div>
            <div className={`suggestion-item__description break-words whitespace-normal text-xs leading-tight${
              suggestion.isLoading ? " text-gray-400 italic" : ""
            }`}>
              {displayDescription}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showOptionsIcon && (
            <div className="suggestion-item__icon-wrapper flex-shrink-0">
              <img
                className="suggestion-item__icon--svg"
                src={Icon.Ellipsis}
                alt="options"
              />
            </div>
          )}
          {suggestion.type && <CommandActionSymbol type={suggestion.type} />}
        </div>
      </div>
    </button>
  );
}

export default SuggestionElement;
