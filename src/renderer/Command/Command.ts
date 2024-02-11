import albumart from 'assets/house_of_balloons.png';
import { SuggestionData } from '../components/Suggestion/Suggestion';

interface Command {
  prefix: string;
  getSuggestions(
    input: string,
    isActiveCommand: boolean,
  ): Promise<SuggestionData[]>;
  id: string;
}

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
