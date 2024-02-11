import playIcon from 'assets/svg/play.svg';
import pauseIcon from 'assets/svg/pause.svg';
import nextIcon from 'assets/svg/forward.svg';
import previousIcon from 'assets/svg/backward.svg';

import { SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';
import Command from '../Command';

const ResumeCommand: Command = {
  id: 'resume',
  prefix: 'resume',
  getSuggestions: (input: string): SuggestionData[] => {
    return [
      {
        title: 'Resume',
        description: 'Resume playback',
        icon: playIcon,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'play',
        } as SetActiveCommandAction,
      },
    ];
  },
};

const PauseCommand: Command = {
  id: 'pause',
  prefix: 'pause',
  getSuggestions: (input: string): SuggestionData[] => {
    return [
      {
        title: 'Pause',
        description: 'Pause the current playback',
        icon: pauseIcon,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'pause',
        } as SetActiveCommandAction,
      },
    ];
  },
};

const NextCommand: Command = {
  id: 'next',
  prefix: 'next',
  getSuggestions: (input: string): SuggestionData[] => {
    return [
      {
        title: 'Next',
        description: 'Play the next song',
        icon: nextIcon,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'next',
        } as SetActiveCommandAction,
      },
    ];
  },
};

const PreviousCommand: Command = {
  id: 'previous',
  prefix: 'previous',
  getSuggestions: (input: string): SuggestionData[] => {
    return [
      {
        title: 'Previous',
        description: 'Play the previous song',
        icon: previousIcon,
        action: {
          type: 'setActiveCommand',
          parentCommandId: 'previous',
        } as SetActiveCommandAction,
      },
    ];
  },
};

export { ResumeCommand, PauseCommand, NextCommand, PreviousCommand };
