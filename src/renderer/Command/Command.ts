import logo from 'assets/svg/spotify-logo.svg';
import queueIcon from 'assets/svg/queue.svg';
import playIcon from 'assets/svg/play.svg';
import onekiss from 'assets/Calvin_Harris_and_Dua_Lipa_One_Kiss.png';
import ophelia from 'assets/Cleopatra_album_cover.jpg';
import oceanavenue from 'assets/ocean_avenue.jpg';
import onedance from 'assets/one_dance.jpg';
import otherside from 'assets/otherside_album_art.jpg';
import albumart from 'assets/house_of_balloons.png';
import { SuggestionData } from '../components/Suggestion/Suggestion';
import { SetActiveCommandAction } from '../Action/Action';

interface Command {
  prefix: string;
  getSuggestions(input: string, isActiveCommand: boolean): SuggestionData[];
  id: string;
}

export const PlayCommand: Command = {
  id: 'play',
  prefix: 'play',
  getSuggestions: (input: string): SuggestionData[] => {
    return [
      {
        title: 'Play',
        description: 'Play a song',
        icon: playIcon,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'play',
        } as SetActiveCommandAction,
      },
    ];
  },
};

export const QueueCommand: Command = {
  id: 'queue',
  prefix: 'queue',
  getSuggestions: (
    input: string,
    isActiveCommand: boolean,
  ): SuggestionData[] => {
    if (!input.startsWith('queue') && !isActiveCommand) {
      return [
        {
          title: 'Queue',
          description: 'Adds a song to the queue',
          icon: queueIcon,
          action: {
            type: 'setActiveCommand',
            parentCommandId: 'queue',
          } as SetActiveCommandAction,
        },
      ];
    }

    return [
      {
        title: 'One Kiss',
        description: 'By Calvin Harris and Dua Lipa',
        icon: onekiss,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'queue',
        } as SetActiveCommandAction,
      },
      {
        title: 'Opheila',
        description: 'By The Lumineers',
        icon: ophelia,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'queue',
        } as SetActiveCommandAction,
      },
      {
        title: 'Ocean Avenue',
        description: 'By Yellowcard',
        icon: oceanavenue,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'queue',
        } as SetActiveCommandAction,
      },
      {
        title: 'One Dance',
        description: 'By Drake, Kyla Reid and Wizkid',
        icon: onedance,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'queue',
        } as SetActiveCommandAction,
      },
      {
        title: 'Otherside',
        description: 'By Red Hot Chili Peppers',
        icon: otherside,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'queue',
        } as SetActiveCommandAction,
      },
    ];
  },
};

export const AutoPlayCommand: Command = {
  id: 'autoplay',
  prefix: 'House of balloons',
  getSuggestions: (input: string): SuggestionData[] => {
    return [
      {
        title: 'House of balloons',
        description: 'by The Weeknd',
        icon: albumart,
        action: { type: 'fill', payload: 'play', parentCommandId: 'autoplay' },
      },
    ];
  },
};

export default Command;
