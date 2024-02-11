import playIcon from 'assets/svg/play.svg';
import { SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';
import Command from '../Command';

const PlayCommand: Command = {
  id: 'play',
  prefix: 'play',
  getSuggestions: (input: string): SuggestionData[] => {
    return [
      {
        title: 'Play',
        description: 'Play a song',
        icon: playIcon,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'play',
        } as SetActiveCommandAction,
      },
    ];
  },
};

export default PlayCommand;
