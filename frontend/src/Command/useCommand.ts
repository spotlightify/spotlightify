import { useCallback, useMemo, useState } from 'react';
import { Command, SuggestionList } from './interfaces';

const baseUrl = 'http://localhost:49264';

function useCommand(promptText: string) {
  const [commandStack, setCommandStack] = useState<Command[]>([]);
  const activeCommand = commandStack[commandStack.length - 1];
  const fullCommandPath = useMemo(
    () => commandStack.map((command) => command.id).join('/'),
    [commandStack],
  );

  const getCommandSuggestions = async (input: string) => {
    const response = await fetch(`${baseUrl}/command?search=${input}`);
    const data = await response.json();
    return data as SuggestionList;
  };

  const getSuggestionsByCommand = useCallback(
    async (commandId: string, input: string) => {
      const response = await fetch(
        `${baseUrl}/command/${fullCommandPath}?op=get-suggestions&input=${input}`,
      );
      const data = await response.json();
      return data as SuggestionList;
    },
    [fullCommandPath],
  );

  const pushCommand = (command: Command, preserveInput: boolean) => {
    const newCommandStack = [...commandStack];
    if (commandStack.length > 0) {
      newCommandStack[newCommandStack.length - 1].input = promptText;
    }
    if (preserveInput) {
      command.input = promptText;
    } else {
      command.input = ''; // must be explicitly set to empty string
    }
    newCommandStack.push(command);
    setCommandStack(newCommandStack);
  };

  const popCommand = () => {
    const newStack = [...commandStack];
    newStack.pop();
    setCommandStack(newStack);
  };

  const clearCommands = () => {
    setCommandStack([]);
  };

  const fetchSuggestions = useCallback(
    async (input: string) => {
      try {
        let suggestions: SuggestionList;
        if (!activeCommand) {
          suggestions = await getCommandSuggestions(input);
        } else {
          suggestions = await getSuggestionsByCommand(activeCommand.id, input);
        }

        return suggestions;
      } catch (error) {
        return {
          items: [
            {
              title: 'Error',
              description:
                'Failed to fetch suggestions, please restart Spotlightify.',
              icon: 'error',
              id: 'error',
              action: {},
            },
          ],
          filter: false,
        };
      }
    },
    [activeCommand, getSuggestionsByCommand],
  );

  return {
    activeCommand,
    fetchSuggestions,
    pushCommand,
    popCommand,
    clearCommands,
    fullCommandPath,
  };
}

export default useCommand;
