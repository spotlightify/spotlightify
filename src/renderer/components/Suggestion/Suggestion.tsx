import { Action } from '../../Action/Action';

export interface SuggestionData {
  title: string;
  description: string;
  icon: string | undefined;
  action: Action;
}

interface SuggestionProps {
  suggestion: SuggestionData;
  isFocused: boolean;
  handleAction: () => void;
}

function Suggestion({
  suggestion,
  isFocused = false,
  handleAction,
}: SuggestionProps) {
  return (
    <button
      type="button"
      className={`suggestion-item ${isFocused ? 'button--focus' : ''}`}
      onClick={handleAction}
    >
      <div className="suggestion-item__icon-wrapper">
        <img
          className={`suggestion-item__icon${suggestion.icon?.endsWith('.svg') ? '--svg' : ''}`}
          src={suggestion.icon}
          alt="icon"
        />
      </div>
      <div className="suggestion-text-wrapper">
        <div className="suggestion-item__title">{suggestion.title}</div>
        <div className="suggestion-item__description">
          {suggestion.description}
        </div>
      </div>
    </button>
  );
}

export default Suggestion;
