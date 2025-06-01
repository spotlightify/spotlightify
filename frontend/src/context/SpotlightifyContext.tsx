import React from "react";
import { createContext, useReducer, useMemo } from "react";
import {
  Action,
  CommandStateItem,
  CommandOptions,
  SpotlightifyActions,
  SuggestionList,
  PopCommandPayload,
} from "../types/command";
import { getActiveCommandItem } from "../utils";
export interface DeveloperOptions {
  disableHide: boolean;
  disableBlur: boolean;
}

export interface SpotlightifyState {
  promptInput: string;
  commandStack: CommandStateItem[];
  suggestions: SuggestionList;
  errorOccurred: boolean;
  placeholderText: string;
  developerOptions: DeveloperOptions;
}

function spotlightifyReducer(
  state: SpotlightifyState,
  action: Action
): SpotlightifyState {
  switch (action.type) {
    case "SET_PROMPT_INPUT":
      return { ...state, promptInput: action.payload };
    case "POP_COMMAND": {
      const newCommandHistory = [...state.commandStack];
      // Call onCancel for side effects on the command that is being popped
      newCommandHistory.pop()?.command?.onCancel?.();
      const oldPromptInput =
        action.payload?.restorePromptInput === false
          ? state.promptInput
          : newCommandHistory.at(-1)?.options?.promptInput ?? "";
      return {
        ...state,
        commandStack: newCommandHistory,
        placeholderText:
          newCommandHistory.at(-1)?.options?.placeholderText ?? "",
        promptInput: oldPromptInput,
      };
    }
    case "PUSH_COMMAND": {
      const pushedCommandHistory = [
        ...state.commandStack,
        {
          command: action.payload.command,
          options: action.payload.options || {},
        },
      ];
      if (pushedCommandHistory.length > 1) {
        const lastCommand =
          pushedCommandHistory[pushedCommandHistory.length - 2];
        if (lastCommand && lastCommand.options) {
          lastCommand.options.promptInput = state.promptInput;
        }
      }
      return {
        ...state,
        promptInput: "",
        placeholderText: action.payload.options?.placeholderText ?? "",
        commandStack: pushedCommandHistory,
      };
    }
    case "SET_ACTIVE_COMMAND": {
      const pushedCommandHistory = [
        ...state.commandStack,
        {
          command: action.payload.command,
          options: action.payload.options || {},
        },
      ];
      if (pushedCommandHistory.length > 1) {
        const lastCommand =
          pushedCommandHistory[pushedCommandHistory.length - 2];
        if (lastCommand && lastCommand.options) {
          lastCommand.options.promptInput = state.promptInput;
        }
      }
      return {
        ...state,
        promptInput: "",
        placeholderText: action.payload.options?.placeholderText ?? "",
        commandStack: pushedCommandHistory,
      };
    }
    case "REPLACE_ACTIVE_COMMAND": {
      if (state.commandStack.length === 0) {
        // No active command, so push a new one (similar to PUSH_COMMAND logic)
        const pushedCommandHistory = [
          {
            command: action.payload.command,
            options: action.payload.options || {},
          },
        ];
        return {
          ...state,
          promptInput: "",
          placeholderText: action.payload.options?.placeholderText ?? "",
          commandStack: pushedCommandHistory,
        };
      } else {
        // Replace the active command (existing logic)
        const newCommandStack = [...state.commandStack];
        newCommandStack[newCommandStack.length - 1] = {
          command: action.payload.command,
          options: action.payload.options || {},
        };
        return {
          ...state,
          commandStack: newCommandStack,
        };
      }
    }
    case "CLEAR_COMMANDS":
      state.commandStack.forEach((c) => c.command.onCancel?.());
      return { ...state, commandStack: [] };
    case "SET_SUGGESTION_LIST":
      return { ...state, suggestions: action.payload };
    case "SET_PLACEHOLDER_TEXT":
      return { ...state, placeholderText: action.payload };
    case "RESET_PROMPT":
      state.commandStack.forEach((c) => c.command.onCancel?.());
      return {
        ...state,
        promptInput: "",
        commandStack: [],
        placeholderText: "Spotlightify Search",
        suggestions: { items: [] },
      };
    case "SET_CURRENT_COMMAND_PARAMETERS": {
      const activeCommand = getActiveCommandItem(state.commandStack);
      if (!activeCommand) {
        return state;
      }
      const newActiveCommandOptions = {
        parameters: action.payload,
      } as CommandOptions;
      const newCommandStack = [...state.commandStack];
      newCommandStack[newCommandStack.length - 1].options =
        newActiveCommandOptions;
      return {
        ...state,
        commandStack: newCommandStack,
      };
    }
    case "BATCH_ACTIONS":
      return action.payload.reduce((s, a) => spotlightifyReducer(s, a), state);
    case "REFRESH_SUGGESTIONS": // spreading the commands into a new array to force re-render
      return {
        ...state,
        commandStack: [...state.commandStack],
      };
    case "SET_DEVELOPER_OPTIONS":
      return { ...state, developerOptions: action.payload };
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
    commandStack: [],
    suggestions: { items: [] },
    errorOccurred: false,
    placeholderText: "Spotlightify Search",
    developerOptions: {
      disableHide: false,
      disableBlur: false,
    },
  });

  const actions: SpotlightifyActions = useMemo(
    () => ({
      setPromptInput: (input) =>
        dispatch({ type: "SET_PROMPT_INPUT", payload: input }),
      popCommand: (payload?: PopCommandPayload) =>
        dispatch({
          type: "POP_COMMAND",
          payload: payload ?? { restorePromptInput: true },
        }),
      pushCommand: (command, options?) =>
        dispatch({
          type: "PUSH_COMMAND",
          payload: { command, options },
        }),
      setActiveCommand: (command, options?) =>
        dispatch({
          type: "SET_ACTIVE_COMMAND",
          payload: { command, options },
        }),
      replaceActiveCommand: (command, options?) =>
        dispatch({
          type: "REPLACE_ACTIVE_COMMAND",
          payload: { command, options },
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
      setDeveloperOptions: (options: DeveloperOptions) =>
        dispatch({ type: "SET_DEVELOPER_OPTIONS", payload: options }),
    }),
    []
  );

  return (
    <SpotlightifyContext.Provider value={{ state, actions }}>
      {children}
    </SpotlightifyContext.Provider>
  );
};
