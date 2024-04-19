import { useCallback, useMemo, useState } from 'react';
import { matchStrings } from '../utils';
import Command, { SuggestionData } from './interfaces';
import PlayCommand from './Play/PlayCommand';
import OnlinePlayCommand from './Play/OnlinePlayCommand';

export const commands = [PlayCommand, OnlinePlayCommand];

let debounceTimeout: number | null = null;

const findCommands = (input: string) => {
  const sanitizedInput = input.trim().toLowerCase();
  const foundCommands = commands.filter((command) =>
    matchStrings(sanitizedInput, command.triggerText),
  );
  return foundCommands;
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

  if (activeCommand.debounceMS) {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = window.setTimeout(async () => {
      const suggestions = await activeCommand.getSuggestions({
        input,
        isActiveCommand: true,
      });
      setSuggestions(suggestions);
    }, activeCommand.debounceMS);
  } else {
    const suggestions = await activeCommand.getSuggestions({
      input,
      isActiveCommand: true,
    });
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
    const foundSuggestions = await command.getSuggestions({ input });
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
      const matchedCommands = findCommands(input);

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
