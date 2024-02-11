import onekiss from 'assets/Calvin_Harris_and_Dua_Lipa_One_Kiss.png';
import ophelia from 'assets/Cleopatra_album_cover.jpg';
import oceanavenue from 'assets/ocean_avenue.jpg';
import onedance from 'assets/one_dance.jpg';
import otherside from 'assets/otherside_album_art.jpg';
import queueIcon from 'assets/svg/queue.svg';
import Command from '../Command';
import { SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';

const QueueCommand: Command = {
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
        title: 'Queue',
        description: 'Adds a song to the queue',
        icon: queueIcon,
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

export default QueueCommand;
