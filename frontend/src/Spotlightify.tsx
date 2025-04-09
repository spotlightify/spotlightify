import React from "react";
import { useEffect, useMemo } from "react";
import logo from "./assets/svg/spotify-logo.svg";
import Prompt from "./components/Prompt";
import SuggestionsContainer from "./components/Suggestion/SuggestionsContainer";
import CommandTitle from "./components/CommandTitle";
import useAction from "./hooks/useAction";
import useCommand from "./hooks/useCommand";
import useSuggestion from "./hooks/useSuggestion";
import useDebounce from "./hooks/useDebounce";
import { WindowSetSize } from "../wailsjs/runtime/runtime";
import { useSpotlightify } from "./hooks/useSpotlightify";
import useAuthListeners from "./hooks/useAuthListeners";
import useCheckAuth from "./hooks/useCheckAuth";
import { HideWindow } from "../wailsjs/go/backend/Backend";

function Spotlightify() {
  const { state, actions } = useSpotlightify();
  const activeCommand = state.activeCommand?.command;

  useAuthListeners({ actions });
  useCheckAuth({ actions, commandHistory: state.commandHistory });

  const { commandSearch, commandTitles } = useCommand();

  const { fetchSuggestions, suggestions, errorOccurred } = useSuggestion({
    commandSearch,
  });
  const { handleAction } = useAction();

  const debouncedQuery = useDebounce(
    state.promptInput.toLowerCase().trim(),
    activeCommand?.debounceMS ?? 0
  );

  const onPromptChange = (event: { target: { value: string } }) => {
    const { value } = event.target;
    if (value.endsWith(" ") && suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      if (firstSuggestion.type === "command" && firstSuggestion.action) {
        handleAction(firstSuggestion.action);
      }
    }
    actions.setPromptInput(value);
  };

  const isWindows10 = useMemo(
    () => navigator.userAgent.includes("Windows NT 10"),
    []
  );

  useEffect(() => {
    const onBlur = () => {
      // Check if blur events are disabled in developer options
      if (state.developerOptions.disableBlur) {
        console.log("Blur event ignored (disabled in developer options)");
        return;
      }

      // Check command options
      if (!state.activeCommand?.options?.keepPromptOpen) {
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
  }, [state.activeCommand, actions, state.developerOptions.disableBlur]);

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [fetchSuggestions, debouncedQuery, state.commandHistory]);

  useEffect(() => {
    const maxNumberOfSuggestions = 8;
    WindowSetSize(
      650,
      65 + Math.min(maxNumberOfSuggestions, suggestions.length) * 58
    );
  }, [suggestions.length]);

  // Apply Windows 10 specific styles if needed
  const baseStyle = useMemo(() => {
    if (isWindows10) {
      return { borderRadius: 0 };
    }
    return {};
  }, [isWindows10]);

  return (
    <div className="base" style={baseStyle}>
      <div className="input-wrapper">
        <img
          className="spotify-logo"
          draggable="false"
          src={logo}
          alt="spotify logo"
        />
        <CommandTitle
          commandTitles={commandTitles}
          errorOccurred={errorOccurred}
        />
        <Prompt
          value={state.promptInput}
          onChange={onPromptChange}
          placeHolder={state.placeholderText ?? "Spotlightify Search"}
        />
      </div>
      <SuggestionsContainer
        suggestions={suggestions}
        actionHandler={handleAction}
      />
    </div>
  );
}

export default Spotlightify;
