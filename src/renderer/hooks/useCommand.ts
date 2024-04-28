import { useCallback, useMemo, useState } from 'react';
import { Command } from '../Command/interfaces';

function useCommand() {
  const [commandHistory, setCommandHistory] = useState([] as Command[]);
  const [activeCommand, setActiveCommand] = useState<Command | undefined>(
    undefined,
  );

  // For displaying on the prompt
  const commandTitles = useMemo(() => {
    const titles = commandHistory.reduce((arr: string[], command) => {
      if (command.properties.shorthandPersistOnUI) {
        arr.push(command.properties.shorthandTitle);
      }
      return arr;
    }, []);

    if (activeCommand) {
      titles.push(activeCommand?.properties.title);
    }
    return titles;
  }, [activeCommand, commandHistory]);

  const pushCommand = useCallback(
    (newCommand: Command, currentPromptInput: string) => {
      if (activeCommand) {
        const activeCommandCopy = { ...activeCommand };
        activeCommandCopy.input = currentPromptInput;
        setCommandHistory((prev) => [...prev, activeCommand]);
      }
      setActiveCommand(newCommand);
    },
    [activeCommand],
  );

  const popCommand = useCallback(() => {
    const historyCopy = [...commandHistory];
    setActiveCommand(historyCopy.pop());
    setCommandHistory(historyCopy);
  }, [commandHistory]);

  const clearCommands = useCallback(() => {
    setActiveCommand(undefined);
    setCommandHistory([]);
  }, []);

  const setActiveCommandFunction = useCallback((command: Command) => {
    setActiveCommand(command);
    setCommandHistory([]);
  }, []);

  return {
    activeCommand,
    commandTitles,
    pushCommand,
    popCommand,
    clearCommands,
    setActiveCommand: setActiveCommandFunction,
  };
}

export default useCommand;
