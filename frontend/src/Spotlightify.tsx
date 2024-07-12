import { useEffect, useState } from "react";
import logo from "./assets/svg/spotify-logo.svg";
import Prompt from "./components/Prompt";
import SuggestionsContainer from "./components/Suggestion/SuggestionsContainer";
import useAction from "./hooks/useAction";
import useCommand from "./hooks/useCommand";
import useSuggestion from "./hooks/useSuggestion";
import useDebounce from "./hooks/useDebounce";
import {
  Hide,
  WindowCenter,
  WindowHide,
  WindowSetSize,
} from "../wailsjs/runtime/runtime";

function Spotlightify() {
  const [promptInput, setPromptInput] = useState("");

  const {
    activeCommand,
    commandTitles,
    popCommand,
    pushCommand,
    setActiveCommand,
    clearCommands,
    setCurrentCommandParameters,
  } = useCommand();

  useEffect(() => {
    const onBlur = () => {
      if (!activeCommand?.properties.keepPromptOpen) {
        Hide();
        clearCommands();
        setPromptInput("");
      }
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [activeCommand]);

  const debouncedQuery = useDebounce(
    promptInput,
    activeCommand?.properties.debounceMS ?? 0
  );

  const { fetchSuggestions, setSuggestionList, suggestions, errorOccurred } =
    useSuggestion({
      activeCommand,
      input: promptInput,
    });

  const { handleAction } = useAction({
    pushCommand,
    popCommand,
    setActiveCommand,
    clearCommands,
    setPromptText: setPromptInput,
    activeCommand,
    promptInput,
    setSuggestionList,
    setCurrentCommandParameters,
  });

  const onPromptChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    setPromptInput(value);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!activeCommand) {
          WindowHide();
        }
        popCommand();
      }
      if (event.key === "Backspace") {
        if (promptInput.length === 0 && activeCommand) {
          popCommand();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Remove the event listener on cleanup
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCommand, popCommand, promptInput.length]);

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [fetchSuggestions, debouncedQuery]);

  useEffect(() => {
    const maxNumberOfSuggestions = 8;
    WindowSetSize(
      650,
      66 + Math.min(maxNumberOfSuggestions, suggestions.length) * 58
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
          value={promptInput}
          onChange={onPromptChange}
          placeHolder={
            activeCommand?.properties.placeholderText ?? "Spotlightify Search"
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
