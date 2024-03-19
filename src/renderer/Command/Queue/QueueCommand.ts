import queueIcon from 'assets/svg/queue.svg';
import { AbstractCommand } from '../Command';
import { SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';
import { Song } from '../../../main/database/structs';
import { matchStrings } from '../../utils';

class QueueCommand extends AbstractCommand {
  constructor() {
    super('Queue', ['queue']);
  }

  getSuggestions(
    input: string,
    isActiveCommand: boolean,
  ): Promise<SuggestionData[]> {
    if (matchStrings(input, this.matchStrings) && !isActiveCommand) {
      return Promise.resolve([
        {
          title: 'Queue',
          description: 'Adds a song to the queue',
          icon: queueIcon,
          action: {
            type: 'setActiveCommand',
            parentCommandId: this.id,
          } as SetActiveCommandAction,
        },
      ]);
    }

    const query = input.replace('queue', '').trim();
    return window.database.querySongs(query).then((songs: Song[]) => {
      return songs.map<SuggestionData>((song) => ({
        title: song.name,
        description: `by ${song.artist_names}`,
        icon: queueIcon,
        action: {
          payload: () => {
            // TODO Placeholder for call to queue song
            console.log('Now playing: ', song.name, ' by ', song.artist_names);
          },
          type: 'execute',
          parentCommandId: this.id,
        },
      }));
    });
  }
}

export default QueueCommand;
