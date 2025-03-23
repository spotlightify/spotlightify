import React from "react";
import { Suggestion } from "../../types/command";
import CommandActionSymbol from "../CommandActionSymbol";

interface SuggestionProps {
  suggestion: Suggestion;
  isFocused: boolean;
  handleAction: () => void;
}

function SuggestionElement({
  suggestion,
  isFocused = false,
  handleAction,
}: SuggestionProps) {
  return (
    <button
      type="button"
      className={`suggestion-item ${isFocused ? "button--focus" : ""}`}
      onClick={handleAction}
    >
      <div className="flex justify-between w-full items-center">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-shrink">
          <div className="suggestion-item__icon-wrapper flex-shrink-0">
            <img
              className={`suggestion-item__icon${
                suggestion.icon?.endsWith(".svg") ? "--svg" : ""
              }`}
              src={suggestion.icon}
              alt="icon"
            />
          </div>
          <div className="suggestion-text-wrapper min-w-0 overflow-hidden">
            <div className="suggestion-item__title truncate">
              {suggestion.title}
            </div>
            <div className="suggestion-item__description break-words whitespace-normal text-xs leading-tight">
              {suggestion.description}
            </div>
          </div>
        </div>
        {suggestion.type && <CommandActionSymbol type={suggestion.type} />}
      </div>
    </button>
  );
}

export default SuggestionElement;
