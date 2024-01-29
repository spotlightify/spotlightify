import { useEffect, useMemo, useState } from 'react';
import logo from 'assets/svg/spotify-logo.svg';
import Prompt from './components/Prompt';
import Suggestion, { SuggestionData } from './components/Suggestion/Suggestion';
import Command, { AutoPlayCommand, PlayCommand } from './Command/Command';
import { Action } from './Action/Action';
import { ActionHandler, ActionSetters } from './Action/Handler';
import commandMatcher, { commands } from './Command/Commander';

function Spotlightify() {
  const [promptText, setPromptText] = useState('');
  const [activeCommand, setActiveCommand] = useState<Command | undefined>();
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([]);

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
    setSuggestions(commandMatcher(promptText, activeCommand));
  }, [activeCommand, promptText]);

  useEffect(() => {
    window.electron.setNumberOfSuggestions(suggestions.length);
  }, [suggestions.length]);

  const actionSetters: ActionSetters = {
    setActiveCommand: (commandId: string) => {
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
  };

  const suggestionElements = suggestions.map((suggestion) => (
    <Suggestion
      key={suggestion.title}
      suggestion={suggestion}
      actionHandler={() => ActionHandler(suggestion.action, actionSetters)}
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
      <div className="suggestions-wrapper">{suggestionElements}</div>
    </div>
  );
}

export default Spotlightify;
