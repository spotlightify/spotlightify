import BaseCommand from "./baseCommand";
import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import Icon from "../../types/icons";
import { Pause } from "../../../wailsjs/go/backend/Backend";
import { executePlaybackAction } from "./utils";

class PauseCommand extends BaseCommand {
  constructor() {
    super("pause", "Pause", "pause", 0, "pause", {});
  }

  async getSuggestions(_params: SuggestionsParams): Promise<SuggestionList> {
    return Promise.resolve({ items: [] });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Pause",
      description: "Pause the current track",
      icon: Icon.Pause,
      id: this.id,
      type: "action",
      action: async (actions) => {
        await executePlaybackAction({
          playbackAction: () => Pause(),
          opName: "Pause",
          actions,
          enableDeviceErrorRetry: false,
        });
        return Promise.resolve();
      },
    };
  }
}

export default PauseCommand;
