import { useEffect, useMemo, useRef, useState } from "react";
import logo from "./assets/svg/spotify-logo.svg";
import Prompt from "./components/Prompt";
import SuggestionsContainer from "./components/Suggestion/SuggestionsContainer";
import useAction from "./hooks/useAction";
import useCommand from "./hooks/useCommand";
import useSuggestion from "./hooks/useSuggestion";
import useDebounce from "./hooks/useDebounce";
import { Hide, WindowHide, WindowSetSize } from "../wailsjs/runtime/runtime";
import { useSpotlightify } from "./hooks/useSpotlightify";
import useAuthListeners from "./hooks/useAuthListeners";
import useCheckAuth from "./hooks/useCheckAuth";

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
    state.promptInput,
    activeCommand?.debounceMS ?? 0
  );

  const onPromptChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    actions.setPromptInput(value);
  };

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
              {commandTitles.join(" → ")}
            </div>
          </div>
        )}
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
