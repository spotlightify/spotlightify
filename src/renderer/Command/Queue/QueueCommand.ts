import queueIcon from 'assets/svg/queue.svg';
import { AbstractCommand } from '../Command';
import { NullAction, SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';
import { Song } from '../../../main/database/structs';
import { matchStrings } from '../../utils';
import spotifyApi from '../Spotify';

class QueueCommand extends AbstractCommand {
  constructor() {
    super('queue', ['queue'], 'Queue');
  }

  async getSuggestions(
    input: string,
    isActiveCommand: boolean,
  ): Promise<SuggestionData[]> {
    if (matchStrings(input, this.matchStrings) && !isActiveCommand) {
      return Promise.resolve([
        {
          title: 'Queue',
          description: 'Adds a song to the queue',
          icon: queueIcon,
          id: 'queue',
          action: {
            type: 'setActiveCommand',
            parentCommandId: this.id,
          } as SetActiveCommandAction,
        },
      ]);
    }

    const query = input.replace('queue', '').trim();
    try {
      const songs = (await window.database.querySongs(query)) as Song[];

      if (songs.length === 0) {
        return [
          {
            title: 'No results found',
            description: 'Please try searching for something else',
            icon: queueIcon,
            id: 'no-results',
            action: {
              type: 'nullAction',
            } as NullAction,
          },
        ];
      }

      return songs.map<SuggestionData>((song) => ({
        title: song.name,
        description: `by ${song.artist_names}`,
        icon: String(song.id),
        id: song.spotify_id,
        action: {
          payload: async () => {
            await spotifyApi.player.addItemToPlaybackQueue(
              `spotify:track:${song.spotify_id}`,
            );
          },
          type: 'execute',
          parentCommandId: this.id,
        },
      }));
    } catch (e) {
      return [];
    }
  }
}

export default QueueCommand;
