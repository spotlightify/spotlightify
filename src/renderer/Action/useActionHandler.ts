import { useCallback, useEffect, useState } from 'react';
import { Action } from './Action';
import { SuggestionData } from '../Command/interfaces';

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
    // TODO Actions should be queued
    if (actionToRun) {
      // If there's already an action to run, don't run another one
      return;
    }
    setActionToRun(action);
  };

  const actionHandler = useCallback(
    async (action: Action) => {
      if (action.executeOnEnter) {
        try {
          await action.executeOnEnter();
        } catch (e) {
          console.error(e); // TODO handle error properly
        }
      }

      if (action.activeCommandId) {
        setActiveCommandID(action.activeCommandId);
      }

      if (action.clearActiveCommand) {
        if (action.activeCommandId) {
          console.warn(
            "Conflict: clearActiveCommand and activeCommandId can't both be set",
          ); // TODO handle conflict properly
        } else {
          setActiveCommandID(undefined);
        }
      }

      if (action.closePrompt) {
        // TODO write code for closePrompt
      }

      if (action.setPromptText) {
        // Insert your code here for setPromptText
        // Check for conflict with preservePromptText
        if (action.preservePromptText) {
          console.warn(
            "Conflict: setPromptText and preservePromptText can't both be set",
          ); // TODO handle conflict properly
        }
        setPromptText(action.setPromptText);
      }

      if (!action.preservePromptText) {
        setPromptText('');
      }

      setActionToRun(undefined);
    },
    [setActiveCommandID, setPromptText],
  );

  useEffect(() => {
    if (actionToRun) {
      actionHandler(actionToRun);
    }
  }, [actionToRun, actionHandler]);

  return runAction;
}
