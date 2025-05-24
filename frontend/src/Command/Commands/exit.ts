import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import Icon from "../../types/icons";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { HideWindow } from "../../../wailsjs/go/backend/Backend";
import { Quit } from "../../../wailsjs/runtime/runtime";

class ExitCommand extends BaseCommand {
  constructor() {
    super("exit", "Exit", "exit", 0, "exit", {});
  }

  async getSuggestions(_params: SuggestionsParams): Promise<SuggestionList> {
    return Promise.resolve({ items: [] });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Exit",
      description: "Exit the application",
      icon: Icon.Exit,
      id: this.id,
      type: "action",
      action: async (actions) => {
        HideWindow();
        actions.resetPrompt();
        try {
          await Quit();
        } catch (e) {
          HandleGenericError({
            opName: "Exit",
            error: e,
            actions: actions,
          });
        }
        return Promise.resolve();
      },
    };
  }
}

export default ExitCommand;
