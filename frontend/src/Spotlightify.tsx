import React from "react";
import { useMemo } from "react";
import logo from "./assets/svg/spotify-logo.svg";
import Prompt from "./components/Prompt";
import SuggestionsContainer from "./components/Suggestion/SuggestionsContainer";
import CommandTitle from "./components/CommandTitle";
import useAction from "./hooks/useAction";
import useCommand from "./hooks/useCommand";
import useDebounce from "./hooks/useDebounce";
import { useSpotlightify } from "./hooks/useSpotlightify";
import useAuthListeners from "./hooks/useAuthListeners";
import useCheckAuth from "./hooks/useCheckAuth";
import useHandlers from "./hooks/useHandlers";
import { getActiveCommandItem } from "./utils/utils";

function Spotlightify() {
  const { state, actions } = useSpotlightify();
  const activeCommand = getActiveCommandItem(state.commandStack)?.command;

  useAuthListeners({ actions });
  useCheckAuth({ actions, commandStack: state.commandStack });

  const suggestions = state.suggestions.items;

  const { handleAction } = useAction();

  const debouncedQuery = useDebounce(
    state.promptInput.toLowerCase().trim(),
    activeCommand?.debounceMS ?? 0
  );
  useCommand({ debouncedInput: debouncedQuery });
  useHandlers();

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
        <CommandTitle />
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
