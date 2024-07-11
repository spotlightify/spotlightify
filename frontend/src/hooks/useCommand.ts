import { useCallback, useMemo, useState } from "react";
import { Command, CommandParameters } from "../Command/interfaces";
import { model } from "../../wailsjs/go/models";

function useCommand() {
  const [commandHistory, setCommandHistory] = useState([] as model.Command[]);
  const [activeCommand, setActiveCommand] = useState<model.Command | undefined>(
    undefined
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
    (newCommand: model.Command, currentPromptInput: string) => {
      if (activeCommand) {
        const activeCommandCopy = activeCommand;
        activeCommandCopy.promptText = currentPromptInput;
        setCommandHistory((prev) => [...prev, activeCommandCopy]);
      }
      setActiveCommand(newCommand);
    },
    [activeCommand]
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

  const setCurrentCommandParameters = useCallback(
    (parameters: CommandParameters) => {
      setActiveCommand((prev) => {
        if (prev) {
          return {
            ...prev,
            parameters: {
              ...parameters,
            },
            convertValues: prev.convertValues,
          };
        }
        return prev;
      });
    },
    []
  );

  const setActiveCommandFunction = useCallback((command: model.Command) => {
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
    setCurrentCommandParameters,
  };
}

export default useCommand;
