import {
  Action,
  Command,
  CommandParameters,
  SuggestionData,
  SuggestionList,
} from '../Command/interfaces';
import useTaskQueue, { Task } from './useTaskQueue';

export interface ActionSetters {
  setPrompt: (text: string) => void;
  setSuggestions: (suggestions: SuggestionData[]) => void;
  setActiveCommand: (commandId: string | undefined) => void;
}

interface useActionHandlerNewProps {
  pushCommand: (command: Command, preserveInput: boolean) => void;
  popCommand: () => void;
  clearCommands: () => void;
  setPromptText: (text: string) => void;
  setCurrentCommandParameters: (parameters: CommandParameters) => void;
  setErrorSuggestion: (setErrorSuggestion: SuggestionData) => void;
  fullCommandPath: string;
}

function handleCommandActions(
  action: Action,
  stateModifiers: useActionHandlerNewProps,
) {
  if (action.commandOptions?.pushCommand) {
    stateModifiers.pushCommand(
      action.commandOptions?.pushCommand,
      action.promptState?.preservePromptText || false,
    );
  }

  if (action.commandOptions?.clearCommandStack) {
    stateModifiers.clearCommands();
  }

  if (action.commandOptions?.popCommand) {
    stateModifiers.popCommand();
  }

  if (action.commandOptions?.setCurrentCommandParameters) {
  }
}

export function useActionHandlerNew(stateModifiers: useActionHandlerNewProps) {
  // TODO implement execution queue
  const { addTask } = useTaskQueue({ shouldProcess: true });

  const handleAction = (action: Action) => {
    const handleExecution: Task = async () => {
      try {
        const response = await fetch(
          `http://localhost:49264/command/${fullCommandPath}?op=action`,
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

    handleCommandActions(action, stateModifiers);

    if (action.executeAction) {
      addTask(handleExecution);
    }
    // TODO implement other actions
  };

  return handleAction;
}
