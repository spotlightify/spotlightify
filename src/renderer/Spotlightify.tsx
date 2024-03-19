import { useCallback, useEffect, useState } from 'react';
import logo from 'assets/svg/spotify-logo.svg';
import Prompt from './components/Prompt';
import { SuggestionData } from './components/Suggestion/Suggestion';
import SuggestionsContainer from './components/Suggestion/SuggestionsContainer';
import { Action } from './Action/Action';
import useCommands from './Command/CommandsHook';

function Spotlightify() {
  const [promptText, setPromptText] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([]);
  const { activeCommand, setActiveCommandID, fetchSuggestions } = useCommands();

  const onPromptChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    setPromptText(value);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!activeCommand) {
          window.electron.minizeWindow();
        }
        setActiveCommandID(undefined);
      }
      if (event.key === 'Backspace') {
        if (promptText.length === 0 && activeCommand) {
          setActiveCommandID(undefined);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Remove the event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCommand, promptText.length, setActiveCommandID]);

  useEffect(() => {
    const fetchAndSetSuggestions = async () => {
      try {
        const result = await fetchSuggestions(promptText);
        setSuggestions(result);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchAndSetSuggestions();
  }, [activeCommand, promptText, fetchSuggestions]);

  useEffect(() => {
    window.electron.setNumberOfSuggestions(suggestions.length);
  }, [suggestions.length]);

  const actionHandler = useCallback(
    (action: Action) => {
      switch (action.type) {
        case 'fill':
          setPromptText(action.payload);
          break;
        case 'setActiveCommand':
          setActiveCommandID(action.parentCommandId);
          setPromptText('');
          break;
        case 'execute':
          action.payload();
          setPromptText('');
          setActiveCommandID(undefined);
          break;
        default:
          break;
      }
    },
    [setActiveCommandID],
  );

  return (
    <div className="base">
      <div className="input-wrapper">
        <img className="spotify-logo" src={logo} alt="spotify logo" />
        {activeCommand && (
          <div className="active-command">{activeCommand.id}</div>
        )}
        <Prompt value={promptText} onChange={onPromptChange} />
      </div>
      <SuggestionsContainer
        suggestions={suggestions}
        actionHandler={(action: Action) => actionHandler(action)}
      />
    </div>
  );
}

export default Spotlightify;
