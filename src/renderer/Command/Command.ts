import { SuggestionData } from '../components/Suggestion/Suggestion';

interface Command {
  matchStrings: string[];
  id: string;
  title: string;
  getSuggestions(
    input: string,
    isActiveCommand: boolean,
  ): Promise<SuggestionData[]>;
  debounce?: boolean;
}

export abstract class AbstractCommand implements Command {
  #id: string;

  #matchStrings: string[];

  #debounce: boolean;

  #title: string;

  /**
   * Represents a command.
   * @constructor
   * @param {string} id - The ID of the command.
   * @param {string} matchStrings - The match strings for the command.
   * @param {boolean} debounce - Whether the command should debounce. Only debounces when the command is active.
   */
  constructor(
    id: string,
    matchStrings: string[],
    title: string,
    debounce = false,
  ) {
    this.#id = id;
    this.#matchStrings = matchStrings;
    this.#title = title;
    this.#debounce = debounce;
  }

  get title(): string {
    return this.#title;
  }

  get id(): string {
    return this.#id;
  }

  get matchStrings(): string[] {
    return this.#matchStrings;
  }

  get debounce(): boolean {
    return this.#debounce;
  }

  abstract getSuggestions(
    input: string,
    isActiveCommand: boolean,
  ): Promise<SuggestionData[]>;
}

export default Command;
