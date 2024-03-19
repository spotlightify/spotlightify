/* eslint-disable class-methods-use-this */
import previousIcon from 'assets/svg/backward.svg';
import { SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';
import { AbstractCommand } from '../Command';

export default class PreviousCommand extends AbstractCommand {
  constructor() {
    super('previous', ['previous']);
  }

  getSuggestions(): Promise<SuggestionData[]> {
    return Promise.resolve([
      {
        title: 'Previous',
        description: 'Play the previous song',
        icon: previousIcon,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'previous',
        } as SetActiveCommandAction,
      },
    ]);
  }
}
