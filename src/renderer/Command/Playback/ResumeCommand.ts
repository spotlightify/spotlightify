/* eslint-disable class-methods-use-this */
import playIcon from 'assets/svg/play.svg';

import { SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';
import { AbstractCommand } from '../Command';

export default class ResumeCommand extends AbstractCommand {
  /**
   * No need for 'prefix' based on given schema, but we need to ensure compatibility
   * with the AbstractCommand constructor which expects 'matchStrings'.
   * Assuming 'prefix' serves a similar role to 'matchStrings'.
   */
  constructor() {
    super('Resume', ['resume', 'next', 'skip']);
  }

  getSuggestions(): Promise<SuggestionData[]> {
    return new Promise((resolve) => {
      resolve([
        {
          title: 'Resume',
          description: 'Resume playback',
          icon: playIcon,
          action: {
            type: 'setActiveCommand',
            parentCommandId: 'play',
          } as SetActiveCommandAction,
        },
      ]);
    });
  }
}
