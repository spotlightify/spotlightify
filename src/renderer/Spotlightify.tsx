import { useEffect, useState } from 'react';
import logo from 'assets/svg/spotify-logo.svg';
import Prompt from './components/Prompt';
import { SuggestionData } from './Command/interfaces';
import SuggestionsContainer from './components/Suggestion/SuggestionsContainer';
import useCommands from './Command/useCommand';
import { useActionHandler } from './Action/useActionHandler';

function Spotlightify() {
  const [promptText, setPromptText] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([]);
  const { activeCommand, setActiveCommandID, fetchSuggestions } =
    useCommands(setSuggestions);

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
    fetchSuggestions(promptText);
  }, [promptText, fetchSuggestions]);

  useEffect(() => {
    window.electron.setNumberOfSuggestions(suggestions.length);
  }, [suggestions.length]);

  const actionHandler = useActionHandler({
    setPromptText,
    setActiveCommandID,
    setSuggestions,
  });

  return (
    <div className="base">
      <div className="input-wrapper">
        <img className="spotify-logo" src={logo} alt="spotify logo" />
        {activeCommand && (
          <div className="active-command">{activeCommand.title}</div>
        )}
        <Prompt value={promptText} onChange={onPromptChange} />
      </div>
      <SuggestionsContainer
        suggestions={suggestions}
        actionHandler={actionHandler}
      />
    </div>
  );
}

export default Spotlightify;
