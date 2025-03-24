import BaseCommand from "./baseCommand";
import { Suggestion, SuggestionList } from "../../types/command";
import { HideWindow } from "../../../wailsjs/go/backend/Backend";
import Icon from "../../types/icons";
import { Pause } from "../../../wailsjs/go/backend/Backend";
import { HandleGenericError } from "./utils";

class PauseCommand extends BaseCommand {
  constructor() {
    super("pause", "Pause", "pause", 0, "pause", {});
  }

  getSuggestions(
    _input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
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
        HideWindow();
        actions.resetPrompt();
        try {
          await Pause();
        } catch (e) {
          HandleGenericError("Pause", e, actions.setSuggestionList);
        }
        return Promise.resolve();
      },
    };
  }
}

export default PauseCommand;
