import {Suggestion, SuggestionList, SuggestionsParams,} from "../../types/command";
import Icon from "../../types/icons";
import {Next} from "../../../wailsjs/go/backend/Backend";
import BaseCommand from "./baseCommand";
import {executePlaybackAction} from "./utils";

class NextCommand extends BaseCommand {
  constructor() {
    super("next", "Next", "⏭️", 0, "next", {});
  }

  async getSuggestions(_params: SuggestionsParams): Promise<SuggestionList> {
    return Promise.resolve({items: []});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Next",
      description: "Play the next track",
      icon: Icon.Forward,
      id: this.id,
      type: "action",
      action: async (actions) => {
        await executePlaybackAction({
          playbackAction: () => Next(),
          opName: "Next",
          actions,
        });
        return Promise.resolve();
      },
    };
  }
}

export default NextCommand;
