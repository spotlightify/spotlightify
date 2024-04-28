import { useCallback, useEffect, useState } from 'react';
import {
  Action,
  Command,
  ExecuteAction,
  ExecutionResponse,
  SuggestionList,
} from '../Command/interfaces';

interface useActionHandlerProps {
  pushCommand: (command: Command, oldPromptInput: string) => void;
  popCommand: () => void;
  setActiveCommand: (command: Command) => void;
  clearCommands: () => void;
  setPromptText: (text: string) => void;
  setSuggestionList: (setSuggestionList: SuggestionList) => void;
  activeCommand: Command | undefined;
  promptInput: string;
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
}: useActionHandlerProps) {
  const [actionsToExecute, setActionsToExecute] = useState<ExecuteAction[]>([]);
  const [actionExecuting, setActionExecuting] = useState<
    ExecuteAction | undefined
  >(undefined);

  const addActionToExecute = (executableAction: ExecuteAction) => {
    setActionsToExecute((prev) => [...prev, executableAction]);
  };

  const handleAction = useCallback(
    (action: Action) => {
      if (
        !action.promptState?.setPromptText &&
        !action.promptState?.preservePromptText
      ) {
        setPromptText('');
      }

      if (action.commandOptions?.pushCommand) {
        pushCommand(
          {
            ...action.commandOptions?.pushCommand,
            input: action.promptState?.preservePromptText ? promptInput : '',
          } || false,
          promptInput,
        );
      }

      if (action.commandOptions?.setCommand) {
        action.commandOptions.setCommand.input = action.promptState
          ?.preservePromptText
          ? promptInput
          : '';
        setActiveCommand(action.commandOptions.setCommand);
      }

      if (action.commandOptions?.clearCommandStack) {
        clearCommands();
      }

      if (action.commandOptions?.popCommand) {
        popCommand();
      }

      if (action.executeAction) {
        addActionToExecute(action.executeAction);
      }
      // TODO implement other actions
    },
    [
      clearCommands,
      popCommand,
      promptInput,
      pushCommand,
      setActiveCommand,
      setPromptText,
    ],
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

    const handleExecution = async (executableAction: ExecuteAction) => {
      try {
        const response = await fetch(
          `http://localhost:5000/command/${executableAction.commandId}/action`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(executableAction.data),
          },
        );

        const body: ExecutionResponse = await response.json(); // TODO handle errors sent by the server
        if (body?.action) {
          handleAction(body?.action);
        }
        if (body?.suggestions) {
          setSuggestionList(body.suggestions);
        }
      } catch (error) {
        console.log('task failed: ', error);
      }
    };

    handleExecution(actionExecuting);
    setActionExecuting(undefined);
  }, [actionExecuting, handleAction, setSuggestionList]);

  return { handleAction };
}

export default useAction;
