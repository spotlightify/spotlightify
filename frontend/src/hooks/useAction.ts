import { useCallback } from "react";
import { SuggestionAction } from "../types/command";
import { useSpotlightify } from "./useSpotlightify";

function useAction() {
  const { actions: spotlightifyActions } = useSpotlightify();

  const handleAction = useCallback(
    async (action: SuggestionAction) => {
      try {
        const response = await action(spotlightifyActions);
        if (response) {
          // If the action returns another action, execute it immediately
          await response(spotlightifyActions);
        }
      } catch (error) {
        console.log("task failed: ", error);
      }
    },
    [spotlightifyActions]
  );

  return { handleAction };
}

export default useAction;
