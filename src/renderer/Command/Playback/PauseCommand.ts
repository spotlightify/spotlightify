/* eslint-disable class-methods-use-this */
import pauseIcon from 'assets/svg/pause.svg';
import { SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';
import { AbstractCommand } from '../Command';

export default class PauseCommand extends AbstractCommand {
  constructor() {
    super('pause', ['pause']);
  }

  getSuggestions(): Promise<SuggestionData[]> {
    return Promise.resolve([
      {
        title: 'Pause',
        description: 'Pause the current playback',
        icon: pauseIcon,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'pause',
        } as SetActiveCommandAction,
      },
    ]);
  }
}
