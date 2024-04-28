import { Action, CommandNew, ExecutionResponse } from './Action';
import { SuggestionData, SuggestionList } from '../Command/interfaces';
import useTaskQueue, { Task } from './useTaskQueue';

export interface ActionSetters {
  setPrompt: (text: string) => void;
  setSuggestions: (suggestions: SuggestionData[]) => void;
  setActiveCommand: (commandId: string | undefined) => void;
}

interface useActionHandlerNewProps {
  pushCommand: (command: CommandNew, preserveInput: boolean) => void;
  popCommand: () => void;
  clearCommands: () => void;
  setPromptText: (text: string) => void;
  setErrorSuggestion: (setErrorSuggestion: SuggestionData) => void;
  fullCommandPath: string;
}

export function useActionHandlerNew({
  pushCommand,
  popCommand,
  clearCommands,
  setPromptText,
  setErrorSuggestion,
  fullCommandPath,
}: useActionHandlerNewProps) {
  // TODO implement execution queue
  const { addTask } = useTaskQueue({ shouldProcess: true });

  const handleAction = (action: Action) => {
    const handleExecution: Task = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/command/${fullCommandPath}?op=action`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(action.executeAction?.data),
          },
        );

        const body: ExecutionResponse = await response.json(); // TODO handle errors sent by the server
        if (body?.action) {
          handleAction(body.action);
        }
      } catch (error) {
        console.log('task failed: ', error);
      }
    };

    if (!action.preservePromptText && !action.pushCommand) {
      setPromptText('');
    }

    if (action.pushCommand) {
      pushCommand(action.pushCommand, action.preservePromptText || false);
    }

    if (action.clearCommandStack) {
      clearCommands();
    }

    if (action.popCommand) {
      popCommand();
    }

    if (action.executeAction) {
      addTask(handleExecution);
    }
    // TODO implement other actions
  };

  return handleAction;
}
