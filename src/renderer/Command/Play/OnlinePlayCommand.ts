import playIcon from 'assets/svg/play.svg';
import Command, { inputState, SuggestionData } from '../interfaces';
import { createExecuteAction } from '../../Action/Action';
import spotifyApi from '../Spotify';
import standardDebounceTime from '../../utils/constants';

async function getSuggestions({
  input,
}: inputState): Promise<SuggestionData[]> {
  try {
    const songs = await spotifyApi.search(input, ['track']);

    return songs.tracks.items.map<SuggestionData>((song) => ({
      title: song.name,
      description: `by ${song.artists.map((artist) => artist.name).join(', ')}`,
      icon: playIcon,
      id: song.id,
      action: createExecuteAction(async () => {
        await spotifyApi.player.startResumePlayback('', undefined, [song.uri]);
      }),
    }));
  } catch (error) {
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

const OnlinePlayCommand: Command = {
  triggerText: [],
  getSuggestions,
  id: 'online-play',
  title: 'Online Play',
  debounceMS: standardDebounceTime,
};

export default OnlinePlayCommand;
