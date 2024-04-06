/* eslint-disable class-methods-use-this */
import nextIcon from 'assets/svg/forward.svg';
import { ExecuteAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';
import { AbstractCommand } from '../Command';
import spotifyApi from '../Spotify';

export default class NextCommand extends AbstractCommand {
  constructor() {
    super('next', ['next', 'skip'], 'Next');
  }

  getSuggestions(): Promise<SuggestionData[]> {
    return Promise.resolve([
      {
        title: 'Next',
        description: 'Play the next song',
        icon: nextIcon,
        id: 'next',
        action: {
          type: 'execute',
          parentCommandId: 'next',
          payload: async () => {
            await spotifyApi.player.skipToNext('');
          },
        } as ExecuteAction,
      },
    ]);
  }
}
