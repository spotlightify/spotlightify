import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import { HideWindow } from "../../../wailsjs/go/backend/Backend";
import Icon from "../../types/icons";
import { Previous } from "../../../wailsjs/go/backend/Backend";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";

class PreviousCommand extends BaseCommand {
  constructor() {
    super("previous", "Previous", "previous", 0, "previous", {});
  }

  async getSuggestions({}: SuggestionsParams): Promise<SuggestionList> {
    return Promise.resolve({ items: [] });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Previous",
      description: "Play the previous track",
      icon: Icon.Backward,
      id: this.id,
      type: "action",
      action: async (actions) => {
        HideWindow();
        actions.resetPrompt();
        try {
          await Previous();
        } catch (e) {
          HandleGenericError({
            opName: "Previous Track",
            error: e,
            setActiveCommand: actions.setActiveCommand,
          });
        }
        return Promise.resolve();
      },
    };
  }
}

export default PreviousCommand;
