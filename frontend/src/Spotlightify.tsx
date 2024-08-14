import {useEffect, useMemo, useRef, useState} from "react";
import logo from "./assets/svg/spotify-logo.svg";
import Prompt from "./components/Prompt";
import SuggestionsContainer from "./components/Suggestion/SuggestionsContainer";
import useAction from "./hooks/useAction";
import useCommand from "./hooks/useCommand";
import useSuggestion from "./hooks/useSuggestion";
import useDebounce from "./hooks/useDebounce";
import {Hide, WindowHide, WindowSetSize} from "../wailsjs/runtime/runtime";
import {useSpotlightify} from "./hooks/useSpotlightify";

function Spotlightify() {
  const {state, actions} = useSpotlightify()
  const activeCommand = state.activeCommand?.command;
  const activeCommandOptions = state.activeCommand?.options;
  console.log('Spotlightify: activeCommand', activeCommand);

  const {
    commandSearch,
    commandTitles,
  } = useCommand();

  const {fetchSuggestions, suggestions, errorOccurred} = useSuggestion({
    commandSearch,
  });
  const {handleAction} = useAction();

  const debouncedQuery = useDebounce(
    state.promptInput,
    activeCommand?.debounceMS ?? 0
  );

  const onPromptChange = (event: { target: { value: any } }) => {
    const {value} = event.target;
    actions.setPromptInput(value);
  };

  useEffect(() => {
    if (!activeCommand) {
      actions.setPlaceholderText("Spotlightify Search");
    }
    const onBlur = () => {
      if (!activeCommandOptions?.keepPromptOpen) {
        Hide();
        actions.batchActions([
          {type: "CLEAR_COMMANDS"},
          {type: "SET_PROMPT_INPUT", payload: ""},
          {type: "SET_SUGGESTION_LIST", payload: {items: []}},
        ]);
      }
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [activeCommand]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!activeCommand) {
          WindowHide();
        }
        actions.popCommand();
      }
      if (event.key === "Backspace") {
        if (state.promptInput.length === 0 && activeCommand) {
          actions.popCommand();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Remove the event listener on cleanup
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCommand, state.promptInput.length]);

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [fetchSuggestions, debouncedQuery]);

  useEffect(() => {
    const maxNumberOfSuggestions = 8;
    WindowSetSize(
      650,
      65 + Math.min(maxNumberOfSuggestions, suggestions.length) * 58
    );
  }, [suggestions.length]);

  return (
    <div className="base">
      <div className="input-wrapper">
        <img
          className="spotify-logo"
          draggable="false"
          src={logo}
          alt="spotify logo"
        />
        {commandTitles.length !== 0 && (
          <div className="command-title-container">
            <div
              className={`command-title-container__title${
                errorOccurred ? "--error" : ""
              }`}
            >
              {commandTitles.join("/")}
            </div>
          </div>
        )}
        <Prompt
          value={state.promptInput}
          onChange={onPromptChange}
          placeHolder={
            state.placeholderText ?? "Spotlightify Search"
          }
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
