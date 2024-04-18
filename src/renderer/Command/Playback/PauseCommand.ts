/* eslint-disable class-methods-use-this */
import pauseIcon from 'assets/svg/pause.svg';
import { ExecuteAction } from '../../Action/Action';
import { SuggestionData } from '../interfaces';
import { AbstractCommand } from '../interfaces';
import spotifyApi from '../Spotify';

export default class PauseCommand extends AbstractCommand {
  constructor() {
    super('pause', ['pause'], 'Pause');
  }

  getSuggestions(): Promise<SuggestionData[]> {
    return Promise.resolve([
      {
        title: 'Pause',
        description: 'Pause the current playback',
        icon: pauseIcon,
        id: 'pause',
        action: {
          type: 'execute',
          parentCommandId: 'pause',
          payload: async () => {
            await spotifyApi.player.pausePlayback('');
          },
        } as ExecuteAction,
      },
    ]);
  }
}
