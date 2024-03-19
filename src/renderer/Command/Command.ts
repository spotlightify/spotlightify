import { SuggestionData } from '../components/Suggestion/Suggestion';

interface Command {
  matchStrings: string[];
  id: string;
  getSuggestions(
    input: string,
    isActiveCommand: boolean,
  ): Promise<SuggestionData[]>;
}

export abstract class AbstractCommand implements Command {
  #id: string;

  #matchStrings: string[];

  /**
   * Represents a command.
   * @constructor
   * @param {string} id - The ID of the command.
   * @param {string} matchStrings - The match strings for the command.
   */
  constructor(id: string, matchStrings: string[]) {
    this.#id = id;
    this.#matchStrings = matchStrings;
  }

  get id(): string {
    return this.#id;
  }

  get matchStrings(): string[] {
    return this.#matchStrings;
  }

  abstract getSuggestions(
    input: string,
    isActiveCommand: boolean,
  ): Promise<SuggestionData[]>;
}

export default Command;
