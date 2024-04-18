import playIcon from 'assets/svg/play.svg';
import { AbstractCommand } from '../interfaces';
import { NullAction, SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../interfaces';
import spotifyApi from '../Spotify';

class OnlinePlayCommand extends AbstractCommand {
  constructor() {
    super('online-play', [], 'Online Play', true);
  }

  async getSuggestions(
    input: string,
    isActiveCommand: boolean,
  ): Promise<SuggestionData[]> {
    if (!isActiveCommand) {
      return [];
    }

    try {
      const songs = await spotifyApi.search(input, ['track']);

      return songs.tracks.items.map<SuggestionData>((song) => ({
        title: song.name,
        description: `by ${song.artists.map((artist) => artist.name).join(', ')}`,
        icon: playIcon,
        id: song.id,
        action: {
          type: 'execute',
          parentCommandId: this.id,
          payload: async () => {
            await spotifyApi.player.startResumePlayback('', undefined, [
              song.uri,
            ]);
          },
        },
      }));
    } catch (error) {
      return [
        {
          title: 'An error occurred while searching',
          description: 'Please try again later',
          icon: playIcon,
          id: 'error',
          action: {
            type: 'nullAction',
          } as NullAction,
        },
      ];
    }
  }
}

export default OnlinePlayCommand;
