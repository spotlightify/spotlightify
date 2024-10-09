import React from "react";
import { createContext, useReducer, useMemo } from "react";
import {
  Action,
  CommandHistoryItem,
  CommandOptions,
  SpotlightifyActions,
  SuggestionList,
} from "../types/command";

export interface SpotlightifyState {
  promptInput: string;
  activeCommand: CommandHistoryItem | null;
  commandHistory: CommandHistoryItem[];
  suggestions: SuggestionList;
  errorOccurred: boolean;
  placeholderText: string;
}

function spotlightifyReducer(
  state: SpotlightifyState,
  action: Action
): SpotlightifyState {
  switch (action.type) {
    case "SET_PROMPT_INPUT":
      return { ...state, promptInput: action.payload };
    case "POP_COMMAND": {
      const newCommandHistory = [...state.commandHistory];
      // Call onCancel for side effects on the command that is being popped
      newCommandHistory.pop()?.command?.onCancel?.();
      return {
        ...state,
        commandHistory: newCommandHistory,
        activeCommand: newCommandHistory[newCommandHistory.length - 1] || null,
      };
    }
    case "PUSH_COMMAND": {
      const pushedCommandHistory = [...state.commandHistory, action.payload];
      return {
        ...state,
        commandHistory: pushedCommandHistory,
        activeCommand: action.payload,
      };
    }
    case "SET_ACTIVE_COMMAND":
      state.commandHistory.forEach((c) => c.command.onCancel?.());
      if (action.payload) {
        return {
          ...state,
          commandHistory: [action.payload],
          activeCommand: action.payload,
        };
      }
      return { ...state, commandHistory: [], activeCommand: null };
    case "CLEAR_COMMANDS":
      state.commandHistory.forEach((c) => c.command.onCancel?.());
      return { ...state, commandHistory: [], activeCommand: null };
    case "SET_SUGGESTION_LIST":
      return { ...state, suggestions: action.payload };
    case "SET_PLACEHOLDER_TEXT":
      return { ...state, placeholderText: action.payload };
    case "RESET_PROMPT":
      state.commandHistory.forEach((c) => c.command.onCancel?.());
      return {
        ...state,
        promptInput: "",
        activeCommand: null,
        commandHistory: [],
        placeholderText: "Spotlightify Search",
        suggestions: { items: [] },
      };
    case "SET_CURRENT_COMMAND_PARAMETERS": {
      if (!state.activeCommand) {
        return state;
      }
      const newActiveCommandOptions = {
        parameters: action.payload,
        ...state.activeCommand.options,
      } as CommandOptions;
      return {
        ...state,
        suggestions: { items: [...state.suggestions.items] }, // force re-render
        activeCommand: {
          ...state.activeCommand,
          options: { ...newActiveCommandOptions },
        },
      };
    }
    case "BATCH_ACTIONS":
      return action.payload.reduce((s, a) => spotlightifyReducer(s, a), state);
    case "REFRESH_SUGGESTIONS": // spreading the commands into a new array to force re-render
      return {
        ...state,
        commandHistory: [...state.commandHistory],
      };
    default:
      return state;
  }
}

export const SpotlightifyContext = createContext<{
  state: SpotlightifyState;
  actions: SpotlightifyActions;
} | null>(null);

export const SpotlightifyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(spotlightifyReducer, {
    promptInput: "",
    activeCommand: null,
    commandHistory: [],
    suggestions: { items: [] },
    errorOccurred: false,
    placeholderText: "Spotlightify Search",
  });

  const actions: SpotlightifyActions = useMemo(
    () => ({
      setPromptInput: (input) =>
        dispatch({ type: "SET_PROMPT_INPUT", payload: input }),
      popCommand: () => dispatch({ type: "POP_COMMAND" }),
      pushCommand: (command, options?) =>
        dispatch({ type: "PUSH_COMMAND", payload: { command, options } }),
      setActiveCommand: (command, options?) =>
        dispatch({
          type: "SET_ACTIVE_COMMAND",
          payload: command ? { command, options } : null,
        }),
      clearCommands: () => dispatch({ type: "CLEAR_COMMANDS" }),
      setSuggestionList: (suggestions) =>
        dispatch({ type: "SET_SUGGESTION_LIST", payload: suggestions }),
      setCurrentCommandParameters: (params) =>
        dispatch({ type: "SET_CURRENT_COMMAND_PARAMETERS", payload: params }),
      setPlaceholderText: (text) =>
        dispatch({ type: "SET_PLACEHOLDER_TEXT", payload: text }),
      resetPrompt: () => dispatch({ type: "RESET_PROMPT" }),
      batchActions: (actions: Action[]) =>
        dispatch({ type: "BATCH_ACTIONS", payload: actions }),
      refreshSuggestions: () => dispatch({ type: "REFRESH_SUGGESTIONS" }),
    }),
    []
  );

  return (
    <SpotlightifyContext.Provider value={{ state, actions }}>
      {children}
    </SpotlightifyContext.Provider>
  );
};
