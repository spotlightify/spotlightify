import { useCallback, useEffect, useState } from "react";
import {
  Command,
  CommandParameters,
  ExecutionParameters,
} from "../Command/interfaces";
import { model } from "../../wailsjs/go/models";
import { ExecuteCommand } from "../../wailsjs/go/backend/Backend";
import {
  WindowHide,
  WindowMinimise,
  WindowShow,
} from "../../wailsjs/runtime/runtime";

interface useActionHandlerProps {
  pushCommand: (command: model.Command, oldPromptInput: string) => void;
  popCommand: () => void;
  setActiveCommand: (command: model.Command) => void;
  clearCommands: () => void;
  setPromptText: (text: string) => void;
  setSuggestionList: (setSuggestionList: model.SuggestionList) => void;
  activeCommand: model.Command | undefined;
  promptInput: string;
  setCurrentCommandParameters: (parameters: CommandParameters) => void;
}

function useAction({
  pushCommand,
  popCommand,
  setActiveCommand,
  clearCommands,
  setPromptText,
  setSuggestionList,
  activeCommand,
  promptInput,
  setCurrentCommandParameters,
}: useActionHandlerProps) {
  const [actionsToExecute, setActionsToExecute] = useState<
    model.ExecuteAction[]
  >([]);
  const [actionExecuting, setActionExecuting] = useState<
    model.ExecuteAction | undefined
  >(undefined);

  const addActionToExecute = (executableAction: model.ExecuteAction) => {
    setActionsToExecute((prev) => [...prev, executableAction]);
  };

  const handleAction = useCallback(
    (action: model.Action) => {
      if (action.executeAction) {
        console.log("action.executeAction", action.executeAction);
        addActionToExecute(action.executeAction);
      }

      if (
        !action.promptState?.setPromptText &&
        !action.promptState?.preservePromptText
      ) {
        setPromptText("");
      }

      if (action.promptState?.setPromptText) {
        setPromptText(action.promptState.setPromptText);
      }

      if (action.commandOptions?.pushCommand) {
        pushCommand(
          {
            ...action.commandOptions?.pushCommand,
            promptText: action.promptState?.preservePromptText
              ? promptInput
              : "",
            convertValues: action.commandOptions?.pushCommand.convertValues,
          },
          promptInput
        );
      }

      if (action.commandOptions?.setCommand) {
        action.commandOptions.setCommand.promptText = action.promptState
          ?.preservePromptText
          ? promptInput
          : "";
        setActiveCommand(action.commandOptions.setCommand);
      }

      if (action.commandOptions?.popCommand) {
        popCommand();
      }

      if (action.promptState?.closePrompt) {
        WindowHide();
      }

      if (action.commandOptions?.setCurrentCommandParameters) {
        setCurrentCommandParameters(
          action.commandOptions.setCurrentCommandParameters
        );
      }

      if (action.commandOptions?.clearCommandStack) {
        clearCommands();
      }
      // TODO implement other actions
    },
    [
      clearCommands,
      popCommand,
      promptInput,
      pushCommand,
      setActiveCommand,
      setCurrentCommandParameters,
      setPromptText,
    ]
  );

  useEffect(() => {
    if (!actionExecuting && actionsToExecute.length !== 0) {
      const actionsToExecuteCopy = [...actionsToExecute];
      const newActionExecuting = actionsToExecuteCopy.shift();
      setActionsToExecute(actionsToExecuteCopy);
      setActionExecuting(newActionExecuting);
    }
  }, [actionExecuting, actionsToExecute]);

  useEffect(() => {
    if (!actionExecuting) {
      return;
    }

    const handleExecution = async (executableAction: model.ExecuteAction) => {
      try {
        if (!executableAction.commandId) {
          console.log("No commandId found");
          return;
        }

        const response = await ExecuteCommand(
          executableAction.commandId,
          executableAction.parameters
        );

        if (response?.action) {
          handleAction(response?.action);
        }
        if (response?.suggestions) {
          WindowShow();
          setSuggestionList(response?.suggestions);
        }
      } catch (error) {
        console.log("task failed: ", error);
      }
    };

    handleExecution(actionExecuting);
    setActionExecuting(undefined);
  }, [actionExecuting, handleAction]);

  return { handleAction };
}

export default useAction;
