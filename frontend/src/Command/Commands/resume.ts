import {Suggestion, SuggestionList, SuggestionsParams,} from "../../types/command";
import Icon from "../../types/icons";
import {Resume} from "../../../wailsjs/go/backend/Backend";
import BaseCommand from "./baseCommand";
import {executePlaybackAction} from "./utils";

class ResumeCommand extends BaseCommand {
  constructor() {
    super("resume", "Resume", "resume", 0, "resume", {});
  }

  async getSuggestions(_params: SuggestionsParams): Promise<SuggestionList> {
    return Promise.resolve({items: []});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Resume",
      description: "Resume the current track",
      icon: Icon.Play,
      id: this.id,
      type: "action",
      action: async (actions) => {
        await executePlaybackAction({
          playbackAction: () => Resume(),
          opName: "Resume",
          actions,
        });
        return Promise.resolve();
      },
    };
  }
}

export default ResumeCommand;
