import { useCallback, useMemo, useState } from 'react';
import { SuggestionData } from '../components/Suggestion/Suggestion';
import { matchStrings } from '../utils';
import Command from './Command';
import QueueCommand from './Queue/QueueCommand';
import ResumeCommand from './Playback/ResumeCommand';

export const commands = [
  // PlayCommand,
  // AutoPlayCommand,
  new QueueCommand(),
  new ResumeCommand(),
  // PauseCommand,
  // NextCommand,
  // PreviousCommand,
];

async function CommandMatcher(
  input: string,
  activeCommand: Command | undefined,
): Promise<SuggestionData[]> {
  const suggestionData: SuggestionData[] = [];
  if (input === '') {
    return [];
  }

  if (activeCommand) {
    const suggestions = await activeCommand.getSuggestions(input, true);
    suggestionData.push(...suggestions);
    return suggestionData;
  }

  const sanitizedInput = input.trim().toLowerCase();
  commands.forEach(async (command) => {
    if (
      matchStrings(sanitizedInput, command.matchStrings) &&
      suggestionData.length < 20
    ) {
      const suggestions = await command.getSuggestions(sanitizedInput, false);
      suggestionData.push(...suggestions);
    }
  });

  return suggestionData;
}

const useCommands = () => {
  const [activeCommand, setActiveCommand] = useState<undefined | Command>(
    undefined,
  );

  const commandMap = useMemo(() => {
    const map = new Map<string, Command>();
    commands.forEach((command) => {
      map.set(command.id, command);
    });
    return map;
  }, []);

  const setActiveCommandID = useCallback(
    (id: string | undefined) => {
      setActiveCommand(id ? commandMap.get(id) : undefined);
    },
    [commandMap],
  );

  const fetchSuggestions = useCallback(
    async (input: string) => {
      return CommandMatcher(input, activeCommand);
    },
    [activeCommand],
  );

  return { activeCommand, setActiveCommandID, fetchSuggestions };
};

export default useCommands;
