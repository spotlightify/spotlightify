import { Action } from '../Action/Action';

export interface inputState {
  input: string;
  isActiveCommand?: boolean;
}

export interface SuggestionData {
  title: string;
  description: string;
  icon: string | undefined;
  id: string;
  action: Action;
}

interface Command {
  triggerText: string[];
  id: string;
  title: string;
  getSuggestions(state: inputState): Promise<SuggestionData[]>;
  debounceMS?: number; // debounce time in milliseconds
}

export default Command;
