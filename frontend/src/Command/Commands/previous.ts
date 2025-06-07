import {Suggestion, SuggestionList, SuggestionsParams,} from "../../types/command";
import Icon from "../../types/icons";
import {Previous} from "../../../wailsjs/go/backend/Backend";
import BaseCommand from "./baseCommand";
import {executePlaybackAction} from "./utils";

class PreviousCommand extends BaseCommand {
  constructor() {
    super("previous", "Previous", "previous", 0, "previous", {});
  }

  async getSuggestions(_params: SuggestionsParams): Promise<SuggestionList> {
    return Promise.resolve({items: []});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Previous",
      description: "Play the previous track",
      icon: Icon.Backward,
      id: this.id,
      type: "action",
      action: async (actions) => {
        await executePlaybackAction({
          playbackAction: () => Previous(),
          opName: "Previous",
          actions,
        });
        return Promise.resolve();
      },
    };
  }
}

export default PreviousCommand;
