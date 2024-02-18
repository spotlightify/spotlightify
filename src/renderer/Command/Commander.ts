import { SuggestionData } from '../components/Suggestion/Suggestion';
import Command, { AutoPlayCommand } from './Command';
import QueueCommand from './Queue/QueueCommand';
import PlayCommand from './Play/PlayCommand';
import {
  NextCommand,
  PauseCommand,
  PreviousCommand,
  ResumeCommand,
} from './Playback/PlaybackCommands';

export const commands = [
  // PlayCommand,
  // AutoPlayCommand,
  QueueCommand,
  // ResumeCommand,
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

  commands.forEach(async (command) => {
    if (command.prefix.startsWith(input)) {
      const suggestions = await command.getSuggestions(input, false);
      suggestionData.push(...suggestions);
    }
  });

  return suggestionData;
}

export default CommandMatcher;
