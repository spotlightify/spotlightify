/* eslint-disable class-methods-use-this */
import previousIcon from 'assets/svg/backward.svg';
import { ExecuteAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';
import { AbstractCommand } from '../Command';
import spotifyApi from '../Spotify';

export default class PreviousCommand extends AbstractCommand {
  constructor() {
    super('previous', ['previous'], 'Previous');
  }

  getSuggestions(): Promise<SuggestionData[]> {
    return Promise.resolve([
      {
        title: 'Previous',
        description: 'Play the previous song',
        icon: previousIcon,
        id: 'previous',
        action: {
          type: 'execute',
          parentCommandId: this.id,
          payload: async () => {
            await spotifyApi.player.skipToPrevious('');
          },
        } as ExecuteAction,
      },
    ]);
  }
}
