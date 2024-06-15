export type ExecutionParameters = { [key: string]: string };
export type CommandParameters = { [key: string]: string };

export interface CommandProperties {
  id: string;
  title: string;
  shorthandTitle: string;
  shorthandPersistOnUI: boolean;
  debounceMS: number;
}

export interface ExecuteAction {
  commandId: string;
  data: ExecutionParameters;
  waitTillComplete: boolean;
  closeOnSuccess: boolean;
}

export interface Command {
  id: string;
  input: string;
  properties: CommandProperties;
  parameters?: CommandParameters;
}

interface CommandOptions {
  pushCommand?: Command;
  setCommand?: Command;
  setCurrentCommandParameters?: CommandParameters;
  popCommand?: boolean;
  clearCommandStack?: boolean;
}

interface PromptState {
  closePrompt?: boolean;
  setPromptText?: string;
  preservePromptText?: boolean;
  freezePrompt?: boolean;
}

export interface Action {
  commandOptions?: CommandOptions;
  promptState?: PromptState;
  executeAction?: ExecuteAction;
}

export interface SuggestionData {
  title: string;
  description: string;
  icon?: string;
  id: string;
  action?: Action;
}

export interface SuggestionList {
  items: SuggestionData[];
  filter?: boolean;
  static?: boolean;
  errorOccurred?: boolean;
}

export interface ExecutionResponse {
  action?: Action; // Action side effect
  suggestions?: SuggestionList; // SuggestionList side effect
}

export interface ExecuteActionMessage {
  type: 'execute';
  commandId: string;
  data: ExecutionParameters;
}

export interface GetSuggestionsMessage {
  type: 'getSuggestions';
  commandId: string;
  data: SuggestionList;
}

export type WebSocketMessage = ExecuteActionMessage | GetSuggestionsMessage;
