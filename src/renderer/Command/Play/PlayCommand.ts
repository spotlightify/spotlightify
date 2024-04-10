import playIcon from 'assets/svg/play.svg';
import searchIcon from 'assets/svg/search.svg';
import { AbstractCommand } from '../Command';
import { SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';
import { Song } from '../../../main/database/structs';
import { matchStrings } from '../../utils';
import spotifyApi from '../Spotify';

class PlayCommand extends AbstractCommand {
  constructor() {
    super('play', ['play'], 'Play');
  }

  async getSuggestions(
    input: string,
    isActiveCommand: boolean,
  ): Promise<SuggestionData[]> {
    if (matchStrings(input, this.matchStrings) && !isActiveCommand) {
      return Promise.resolve([
        {
          title: this.title,
          description: 'Plays a song',
          icon: playIcon,
          id: this.id,
          action: {
            type: 'setActiveCommand',
            parentCommandId: this.id,
          } as SetActiveCommandAction,
        },
      ]);
    }

    const query = input.replace('play', '').trim();
    try {
      const songs = (await window.database.querySongs(query)) as Song[];

      if (songs.length === 0) {
        return [
          {
            title: `Search online for ${input}`,
            description: 'Click to search online for this song',
            icon: searchIcon,
            id: 'search-online',
            action: {
              type: 'setActiveCommand',
              parentCommandId: 'online-play',
              preserveInput: true,
            } as SetActiveCommandAction,
          },
        ];
      }

      return songs.map<SuggestionData>((song) => ({
        title: song.name,
        description: `by ${song.artist_names}`,
        icon: playIcon,
        id: song.spotify_id,
        action: {
          payload: async () => {
            await spotifyApi.player.startResumePlayback('', undefined, [
              `spotify:track:${song.spotify_id}`,
            ]);
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

export default PlayCommand;
