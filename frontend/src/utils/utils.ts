import { CommandStateItem } from "../types/command";

export const matchStrings = (input: string, strings: string[]): boolean => {
  return strings.some((str) => str.startsWith(input));
};

export const stringInArrayIsExactMatch = (
  input: string,
  strings: string[]
): boolean => {
  return strings.some((str) => input.slice(0, str.length) === str);
};

export const getActiveCommandItem = (commandStack: CommandStateItem[]) => {
  return commandStack.length > 0 ? commandStack[commandStack.length - 1] : null;
};
