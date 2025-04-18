import { useEffect } from "react";
import { useSpotlightify } from "./useSpotlightify";
import { HideWindow } from "../../wailsjs/go/backend/Backend";
import { WindowHide } from "../../wailsjs/runtime/runtime";
import { getActiveCommandItem } from "../utils";
function useHandlers() {
  const { state, actions } = useSpotlightify();
  const activeCommand = getActiveCommandItem(state.commandStack);

  useEffect(() => {
    const onBlur = () => {
      // Check if blur events are disabled in developer options
      if (state.developerOptions.disableBlur) {
        console.log("Blur event ignored (disabled in developer options)");
        return;
      }

      // Check command options
      if (!activeCommand?.options?.keepPromptOpen) {
        HideWindow();
        actions.batchActions([
          { type: "CLEAR_COMMANDS" },
          { type: "SET_PROMPT_INPUT", payload: "" },
          { type: "SET_SUGGESTION_LIST", payload: { items: [] } },
        ]);
      }
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [activeCommand, actions, state.developerOptions.disableBlur]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!activeCommand) {
          actions.batchActions([
            { type: "CLEAR_COMMANDS" },
            { type: "SET_PROMPT_INPUT", payload: "" },
            { type: "SET_SUGGESTION_LIST", payload: { items: [] } },
            { type: "SET_PLACEHOLDER_TEXT", payload: "Spotlightify Search" },
          ]);

          // In development mode with DeveloperCommand, check alwaysShow setting
          if (!state.developerOptions.disableHide) {
            WindowHide();
          }
        }
        if (activeCommand && !activeCommand?.options?.lockCommandStack) {
          actions.popCommand();
        }
      }
      if (event.key === "Backspace") {
        if (
          state.promptInput.length === 0 &&
          activeCommand &&
          !activeCommand?.options?.lockCommandStack
        ) {
          actions.popCommand();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Remove the event listener on cleanup
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    actions,
    activeCommand,
    activeCommand?.options?.lockCommandStack,
    state.promptInput.length,
    state.developerOptions.disableHide,
  ]);
}

export default useHandlers;
