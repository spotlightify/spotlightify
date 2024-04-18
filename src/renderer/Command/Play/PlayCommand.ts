import playIcon from 'assets/svg/play.svg';
import searchIcon from 'assets/svg/search.svg';
import Command, { inputState, SuggestionData } from '../interfaces';
import { Song } from '../../../main/database/structs';
import spotifyApi from '../Spotify';
import {
  createExecuteAction,
  createSetActiveCommandAction,
} from '../../Action/Action';

async function getSuggestions({
  input,
  isActiveCommand,
}: inputState): Promise<SuggestionData[]> {
  if (!isActiveCommand) {
    return [
      {
        title: 'Play',
        description: 'Plays a song',
        icon: playIcon,
        id: 'Play',
        action: createSetActiveCommandAction('play'),
      },
    ];
  }

  try {
    const songs = (await window.database.querySongs(input)) as Song[];

    const suggestions = [
      {
        title: `Search online for ${input}`,
        description: 'Click to search online for this song',
        icon: searchIcon,
        id: 'search-online',
        action: createSetActiveCommandAction('online-play', {
          preservePromptText: true,
        }),
      },
    ];

    songs.forEach((song) =>
      suggestions.push({
        title: song.name,
        description: `by ${song.artist_names}`,
        icon: playIcon,
        id: song.spotify_id,
        action: createExecuteAction(async () => {
          await spotifyApi.player.startResumePlayback('', undefined, [
            `spotify:track:${song.spotify_id}`,
          ]);
        }),
      }),
    );
    return suggestions;
  } catch (e) {
    return [
      {
        title: 'An error occurred while searching',
        description: 'Please try again later',
        icon: playIcon,
        id: 'error',
        action: { preservePromptText: true },
      },
    ];
  }
}

const PlayCommand: Command = {
  triggerText: ['play'],
  getSuggestions,
  id: 'play',
  title: 'Play',
};

export default PlayCommand;

// class PlayCommand extends AbstractCommand {
//   constructor() {
//     super('play', ['play'], 'Play');
//   }

//   async getSuggestions(
//     input: string,
//     isActiveCommand: boolean,
//   ): Promise<SuggestionData[]> {
//     if (matchStrings(input, this.matchStrings) && !isActiveCommand) {
//       return Promise.resolve([
//         {
//           title: this.title,
//           description: 'Plays a song',
//           icon: playIcon,
//           id: this.id,
//           action: {
//             type: 'setActiveCommand',
//             parentCommandId: this.id,
//           } as SetActiveCommandAction,
//         },
//       ]);
//     }

//     const query = input.replace('play', '').trim();
//     try {
//       const songs = (await window.database.querySongs(query)) as Song[];

//       if (songs.length === 0) {
//         return [
//           {
//             title: `Search online for ${input}`,
//             description: 'Click to search online for this song',
//             icon: searchIcon,
//             id: 'search-online',
//             action: {
//               type: 'setActiveCommand',
//               parentCommandId: 'online-play',
//               preserveInput: true,
//             } as SetActiveCommandAction,
//           },
//         ];
//       }

//       return songs.map<SuggestionData>((song) => ({
//         title: song.name,
//         description: `by ${song.artist_names}`,
//         icon: playIcon,
//         id: song.spotify_id,
//         action: {
//           payload: async () => {
//             await spotifyApi.player.startResumePlayback('', undefined, [
//               `spotify:track:${song.spotify_id}`,
//             ]);
//           },
//           type: 'execute',
//           parentCommandId: this.id,
//         },
//       }));
//     } catch (e) {
//       return [];
//     }
//   }
// }

// export default PlayCommand;
