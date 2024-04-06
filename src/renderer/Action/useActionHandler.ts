import { useCallback, useEffect, useState } from 'react';
import errorIcon from 'assets/svg/exit.svg';
import { Action, ExecuteError } from './Action';
import { SuggestionData } from '../components/Suggestion/Suggestion';

export interface ActionSetters {
  setPrompt: (text: string) => void;
  setSuggestions: (suggestions: SuggestionData[]) => void;
  setActiveCommand: (commandId: string | undefined) => void;
}

interface useActionHandlerControls {
  setPromptText: (text: string) => void;
  setSuggestions: (suggestions: SuggestionData[]) => void;
  setActiveCommandID: (commandId: string | undefined) => void;
}

export function useActionHandler({
  setActiveCommandID,
  setPromptText,
  setSuggestions,
}: useActionHandlerControls) {
  const [actionToRun, setActionToRun] = useState<undefined | Action>(undefined);

  const runAction = (action: Action) => {
    if (actionToRun) {
      // If there's already an action to run, don't run another one
      return;
    }
    setActionToRun(action);
  };

  const actionErrorHandler = useCallback(
    (error: unknown) => {
      const executeError = error as ExecuteError;

      if (!executeError.errorTitle) {
        setSuggestions([
          {
            title: 'Error',
            description: 'An error occurred',
            icon: errorIcon,
            id: 'error',
            action: { type: 'nullAction' },
          },
        ]);
        return;
      }

      setSuggestions([
        {
          title: executeError.errorTitle,
          description: executeError.errorDescription,
          icon: executeError.icon,
          id: 'error',
          action: executeError.action,
        },
      ]);
      if (executeError.clearPrompt) {
        setPromptText('');
      }
      if (executeError.clearActiveCommand) {
        setActiveCommandID(undefined);
      }
    },
    [setSuggestions, setPromptText, setActiveCommandID],
  );

  const actionHandler = useCallback(
    async (action: Action) => {
      switch (action.type) {
        case 'fill':
          setPromptText(action.payload);
          break;
        case 'setActiveCommand':
          setActiveCommandID(action.parentCommandId);
          if (!action.preserveInput) {
            setPromptText('');
          }
          break;
        case 'execute':
          try {
            await action.payload();
          } catch (error) {
            actionErrorHandler(error);
            break;
          }
          setPromptText('');
          setActiveCommandID(undefined);
          break;
        default:
          break;
      }
      setActionToRun(undefined);
    },
    [setPromptText, setActiveCommandID, actionErrorHandler],
  );

  useEffect(() => {
    if (actionToRun) {
      actionHandler(actionToRun);
    }
  }, [actionToRun, actionHandler]);

  return runAction;
}
