import { Action } from './Action';
import { SuggestionData } from '../components/Suggestion/Suggestion';

export interface ActionSetters {
  setPrompt: (text: string) => void;
  setSuggestions: (suggestions: SuggestionData[]) => void;
  setActiveCommand: (commandId: string | undefined) => void;
}

export function ActionHandler(
  action: Action,
  { setPrompt, setSuggestions, setActiveCommand }: ActionSetters,
) {
  switch (action.type) {
    case 'fill':
      setPrompt(action.payload);
      break;
    case 'setActiveCommand':
      setActiveCommand(action.parentCommandId);
      setPrompt('');
      break;
    case 'execute':
      action.payload();
      setPrompt('');
      setActiveCommand(undefined);
      break;
    default:
      break;
  }
}
