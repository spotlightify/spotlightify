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
  PlayCommand,
  AutoPlayCommand,
  QueueCommand,
  ResumeCommand,
  PauseCommand,
  NextCommand,
  PreviousCommand,
];

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
