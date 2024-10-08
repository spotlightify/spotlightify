import React from "react";
import { ModKeys, Suggestion, SuggestionAction } from "../../types/command";

interface SuggestionProps {
  suggestion: Suggestion;
  isFocused: boolean;
  handleAction: (action: SuggestionAction) => void;
  modifierKey?: ModKeys;
}

function SuggestionElement({
  suggestion,
  isFocused = false,
  handleAction,
  modifierKey,
}: SuggestionProps) {
  let action = suggestion.action;
  let description = suggestion.description;
  if (isFocused && modifierKey) {
    action = suggestion.modKeys?.[modifierKey]?.action;
    description = suggestion.modKeys?.[modifierKey]?.description ?? description;
  }

  return (
    <button
      type="button"
      className={`suggestion-item ${isFocused ? "button--focus" : ""}`}
      onClick={() => (action !== undefined ? handleAction(action) : undefined)}
    >
      <div className="suggestion-item__icon-wrapper">
        <img
          className={`suggestion-item__icon${
            suggestion.icon?.endsWith(".svg") ? "--svg" : ""
          }`}
          src={suggestion.icon}
          alt="icon"
        />
      </div>
      <div className="suggestion-text-wrapper">
        <div className="suggestion-item__title">{suggestion.title}</div>
        <div className="suggestion-item__description">{description}</div>
      </div>
    </button>
  );
}

export default SuggestionElement;
