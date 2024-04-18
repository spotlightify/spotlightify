/* eslint-disable class-methods-use-this */
import playIcon from 'assets/svg/play.svg';

import { ExecuteAction } from '../../Action/Action';
import { SuggestionData } from '../interfaces';
import { AbstractCommand } from '../interfaces';
import spotifyApi from '../Spotify';

export default class ResumeCommand extends AbstractCommand {
  constructor() {
    super('Resume', ['resume'], 'Resume');
  }

  getSuggestions(): Promise<SuggestionData[]> {
    return new Promise((resolve) => {
      resolve([
        {
          title: 'Resume',
          description: 'Resume playback',
          icon: playIcon,
          id: 'resume',
          action: {
            type: 'execute',
            parentCommandId: this.id,
            payload: async () => {
              await spotifyApi.player.startResumePlayback('');
            },
          } as ExecuteAction,
        },
      ]);
    });
  }
}
