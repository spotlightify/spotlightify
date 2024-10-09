// import {QueryClient} from "@tanstack/react-query";

import { QueryClient } from "@tanstack/react-query";

export interface Command {
  id: string;
  title: string;
  shorthandTitle: string;
  debounceMS: number;
  parameters: Record<string, string>;
  keyword: string;

  getSuggestions(
    input: string,
    parameters: Record<string, string>,
    queryClient: QueryClient
  ): Promise<SuggestionList>;

  getPlaceholderSuggestion(queryClient: QueryClient): Promise<Suggestion>;

  onCancel?(): void;
}

export interface SuggestionList {
  items: Suggestion[];
  type?: "filter" | "static" | "error";
}

export interface Suggestion {
  title: string;
  description: string;
  icon: string;
  id: string;
  action?: SuggestionAction;
}

export type SuggestionAction = (
  actions: SpotlightifyActions
) => Promise<SuggestionAction | void>;

export interface CommandOptions {
  parameters?: Record<string, string>;
  keepPromptOpen?: boolean;
  lockCommandStack?: boolean; // Prevents the command stack from being altered by interaction through the prompt
}

export interface CommandHistoryItem {
  command: Command;
  options?: CommandOptions;
}

export type Action =
  | { type: "SET_PROMPT_INPUT"; payload: string }
  | { type: "POP_COMMAND" }
  | {
      type: "PUSH_COMMAND";
      payload: { command: Command; options?: CommandOptions };
    }
  | {
      type: "SET_ACTIVE_COMMAND";
      payload: { command: Command; options?: CommandOptions } | null;
    }
  | { type: "CLEAR_COMMANDS" }
  | { type: "SET_SUGGESTION_LIST"; payload: SuggestionList }
  | { type: "SET_PLACEHOLDER_TEXT"; payload: string }
  | { type: "RESET_PROMPT" }
  | { type: "SET_CURRENT_COMMAND_PARAMETERS"; payload: Record<string, string> }
  | { type: "BATCH_ACTIONS"; payload: Action[] }
  | { type: "REFRESH_SUGGESTIONS" };

export interface SpotlightifyActions {
  setPromptInput: (input: string) => void;
  popCommand: () => void;
  pushCommand: (command: Command, options?: CommandOptions) => void;
  setActiveCommand: (command: Command | null, options?: CommandOptions) => void;
  clearCommands: () => void;
  setSuggestionList: (suggestions: SuggestionList) => void;
  setCurrentCommandParameters: (params: Record<string, string>) => void;
  setPlaceholderText: (text: string) => void;
  resetPrompt: () => void;
  batchActions: (actions: Action[]) => void;
  refreshSuggestions: () => void;
}
