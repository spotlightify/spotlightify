import { useCallback, useMemo, useState } from 'react';
import { SuggestionData } from '../components/Suggestion/Suggestion';
import { matchStrings } from '../utils';
import Command from './Command';
import QueueCommand from './Queue/QueueCommand';
import ResumeCommand from './Playback/ResumeCommand';
import NextCommand from './Playback/NextCommand';
import PreviousCommand from './Playback/PreviousCommand';
import PauseCommand from './Playback/PauseCommand';
import DeviceCommand from './Device/DeviceCommand';
import PlayCommand from './Play/PlayCommand';
import OnlinePlayCommand from './Play/OnlinePlayCommand';

export const commands = [
  // PlayCommand,
  // AutoPlayCommand,
  new PlayCommand(),
  new QueueCommand(),
  new ResumeCommand(),
  new PauseCommand(),
  new NextCommand(),
  new PreviousCommand(),
  new DeviceCommand(),
  new OnlinePlayCommand(),
];

let debounceTimeout: number | null = null;

const matchCommands = (input: string) => {
  const sanitizedInput = input.trim().toLowerCase();
  const matchedCommands = commands.filter((command) =>
    matchStrings(sanitizedInput, command.matchStrings),
  );
  return matchedCommands;
};

const getActiveCommandSuggestions = async (
  input: string,
  activeCommand: Command,
  setSuggestions: (suggestions: SuggestionData[]) => void,
): Promise<void> => {
  if (input === '') {
    setSuggestions([]);
    return;
  }

  if (activeCommand.debounce) {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = window.setTimeout(async () => {
      const suggestions = await activeCommand.getSuggestions(input, true);
      setSuggestions(suggestions);
    }, 400); // 300ms debounce time
  } else {
    const suggestions = await activeCommand.getSuggestions(input, true);
    setSuggestions(suggestions);
  }
};

const getSuggestions = async (
  input: string,
  matchedCommands: Command[],
  setSuggestions: (suggestions: SuggestionData[]) => void,
): Promise<void> => {
  if (input === '') {
    setSuggestions([]);
    return;
  }

  const suggestions: SuggestionData[] = [];
  matchedCommands.forEach(async (command) => {
    if (suggestions.length > 20) {
      return;
    }
    const foundSuggestions = await command.getSuggestions(input, false);
    suggestions.push(...foundSuggestions);
  });

  setSuggestions(suggestions);
};

const useCommands = (
  setSuggestions: (suggestions: SuggestionData[]) => void,
) => {
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
      const matchedCommands = matchCommands(input);

      if (activeCommand) {
        await getActiveCommandSuggestions(input, activeCommand, setSuggestions);
        return;
      }
      await getSuggestions(input, matchedCommands, setSuggestions);
    },
    [activeCommand, setSuggestions],
  );

  return { activeCommand, setActiveCommandID, fetchSuggestions };
};

export default useCommands;
