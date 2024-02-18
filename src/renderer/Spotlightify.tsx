import { useEffect, useMemo, useRef, useState } from 'react';
import logo from 'assets/svg/spotify-logo.svg';
import Prompt from './components/Prompt';
import Suggestion, { SuggestionData } from './components/Suggestion/Suggestion';
import Command from './Command/Command';
import { ActionHandler } from './Action/Handler';
import commandMatcher, { commands } from './Command/Commander';

function Spotlightify() {
  const [promptText, setPromptText] = useState('');
  const [activeCommand, setActiveCommand] = useState<Command | undefined>();
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([]);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(0);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const commandMap = useMemo(() => {
    const map = new Map<string, Command>();
    commands.forEach((command) => {
      map.set(command.id, command);
    });
    return map;
  }, []);

  const onPromptChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    setPromptText(value);
  };

  useEffect(() => {
    setFocusedSuggestionIndex(0);
  }, [suggestions]);

  useEffect(() => {
    if (suggestionsRef.current && focusedSuggestionIndex > 7) {
      suggestionsRef.current.scrollTop = 58 * (focusedSuggestionIndex - 7);
    } else if (suggestionsRef.current) {
      suggestionsRef.current.scrollTop = 0;
    }
  }, [focusedSuggestionIndex]);

  const actionSetters = useMemo(
    () => ({
      setActiveCommand: (commandId: string | undefined) => {
        if (!commandId) {
          setActiveCommand(undefined);
          return;
        }
        const command = commandMap.get(commandId);
        if (!command) {
          console.log('Command not found');
          return;
        }
        setActiveCommand(command);
      },
      setPrompt: (text: string) => setPromptText(text),
      setSuggestions: (suggestionData: SuggestionData[]) =>
        setSuggestions(suggestionData),
    }),
    [commandMap],
  );

  useEffect(() => {
    const moveFocusedIndex = (direction: 'up' | 'down') => {
      if (direction === 'up') {
        setFocusedSuggestionIndex((prevIndex) =>
          prevIndex === 0 ? suggestions.length - 1 : prevIndex - 1,
        );
      } else {
        setFocusedSuggestionIndex((prevIndex) =>
          prevIndex === suggestions.length - 1 ? 0 : prevIndex + 1,
        );
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!activeCommand) {
          window.electron.minizeWindow();
        }
        setActiveCommand(undefined);
      }
      if (event.key === 'Backspace') {
        if (promptText.length === 0 && activeCommand) {
          setActiveCommand(undefined);
        }
      }
      if (event.key === 'Tab' || event.key === 'ArrowDown') {
        event.preventDefault();
        moveFocusedIndex('down');
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveFocusedIndex('up');
      }
      if (
        event.key === 'Enter' &&
        suggestions[focusedSuggestionIndex] !== undefined
      ) {
        ActionHandler(
          suggestions[focusedSuggestionIndex].action,
          actionSetters,
        );
      }
    };

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown);

    // Remove the event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    actionSetters,
    activeCommand,
    commandMap,
    focusedSuggestionIndex,
    promptText.length,
    suggestions,
  ]);

  useEffect(() => {
    let abortSignal = false;

    const fetchSuggestions = async () => {
      const result = await commandMatcher(promptText, activeCommand);
      if (!abortSignal) {
        setSuggestions(result);
      }
    };

    fetchSuggestions();

    return () => {
      abortSignal = true;
    };
  }, [activeCommand, promptText]);

  useEffect(() => {
    window.electron.setNumberOfSuggestions(suggestions.length);
  }, [suggestions.length]);

  const suggestionElements = suggestions.map((suggestion, index) => (
    <Suggestion
      key={suggestion.title + suggestion.description}
      suggestion={suggestion}
      isFocused={index === focusedSuggestionIndex}
      handleAction={() => ActionHandler(suggestion.action, actionSetters)}
    />
  ));

  return (
    <div className="base">
      <div className="input-wrapper">
        <img className="spotify-logo" src={logo} alt="spotify logo" />
        {activeCommand && (
          <div className="active-command">{activeCommand.prefix}</div>
        )}
        <Prompt value={promptText} onChange={onPromptChange} />
      </div>
      <div
        ref={suggestionsRef}
        style={{ height: Math.min(suggestions.length, 8) * 58 }}
        className="suggestions-wrapper"
      >
        {suggestionElements}
      </div>
    </div>
  );
}

export default Spotlightify;
