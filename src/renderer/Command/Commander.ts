import { SuggestionData } from '../components/Suggestion/Suggestion';
import Command, { AutoPlayCommand, PlayCommand, QueueCommand } from './Command';

export const commands = [PlayCommand, AutoPlayCommand, QueueCommand];

function CommandMatcher(
  input: string,
  activeCommand: Command | undefined,
): SuggestionData[] {
  const suggestionData: SuggestionData[] = [];
  if (input === '') {
    return [];
  }

  if (activeCommand) {
    suggestionData.push(...activeCommand.getSuggestions(input, true));
    return suggestionData;
  }

  commands.forEach((command) => {
    if (command.prefix.startsWith(input)) {
      suggestionData.push(...command.getSuggestions(input, false));
    }
  });

  return suggestionData;
}

export default CommandMatcher;
