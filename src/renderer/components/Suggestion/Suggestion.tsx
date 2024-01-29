import { Action } from '../../Action/Action';

export interface SuggestionData {
  title: string;
  description: string;
  icon: string | undefined;
  action: Action;
}

interface SuggestionProps {
  suggestion: SuggestionData;
  actionHandler: (action: Action) => void;
}

function Suggestion({ suggestion, actionHandler }: SuggestionProps) {
  const onAction = () => actionHandler(suggestion.action);

  return (
    <button type="button" onClick={onAction} className="suggestion-item">
      <img className="suggestion-item__icon" src={suggestion.icon} alt="icon" />
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
