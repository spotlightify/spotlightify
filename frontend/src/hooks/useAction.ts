import { useCallback, useEffect, useState } from "react";
import { SuggestionAction } from "../types/command";
import { useSpotlightify } from "./useSpotlightify";

function useAction() {
  const { actions: spotlightifyActions } = useSpotlightify();
  const [actionsToExecute, setActionsToExecute] = useState<SuggestionAction[]>(
    []
  );
  const [actionExecuting, setActionExecuting] = useState<
    { actionCallback: SuggestionAction } | undefined
  >(undefined);

  const addActionToExecute = (action: SuggestionAction) => {
    setActionsToExecute((prev) => [...prev, action]);
  };

  useEffect(() => {
    if (!actionExecuting && actionsToExecute.length !== 0) {
      const actionsToExecuteCopy = [...actionsToExecute];
      const newActionExecuting = actionsToExecuteCopy.shift();
      setActionsToExecute(actionsToExecuteCopy);
      setActionExecuting(
        newActionExecuting ? { actionCallback: newActionExecuting } : undefined
      );
    }
  }, [actionExecuting, actionsToExecute]);

  useEffect(() => {
    if (!actionExecuting) {
      return;
    }

    const handleExecution = async () => {
      try {
        const response = await actionExecuting.actionCallback(
          spotlightifyActions
        );

        if (response) {
          addActionToExecute(response);
        }
      } catch (error) {
        console.log("task failed: ", error);
      }
    };

    handleExecution();
    setActionExecuting(undefined);
  }, [actionExecuting, spotlightifyActions]);

  const handleAction = useCallback((action: SuggestionAction) => {
    addActionToExecute(action);
  }, []);

  return { handleAction };
}

export default useAction;
