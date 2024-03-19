/* eslint-disable class-methods-use-this */
import nextIcon from 'assets/svg/forward.svg';
import { SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';
import { AbstractCommand } from '../Command';

export default class NextCommand extends AbstractCommand {
  constructor() {
    super('next', ['next']);
  }

  getSuggestions(): Promise<SuggestionData[]> {
    return Promise.resolve([
      {
        title: 'Next',
        description: 'Play the next song',
        icon: nextIcon,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'next',
        } as SetActiveCommandAction,
      },
    ]);
  }
}
