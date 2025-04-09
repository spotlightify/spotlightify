import { Suggestion, SuggestionList } from "../../types/command";
import Icon from "../../types/icons";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { HideWindow } from "../../../wailsjs/go/backend/Backend";
import { Quit } from "../../../wailsjs/runtime/runtime";

class ExitCommand extends BaseCommand {
  constructor() {
    super("exit", "Exit", "exit", 0, "exit", {});
  }

  getSuggestions(
    _input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
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
          HandleGenericError("Exit", e, actions.setSuggestionList);
        }
        return Promise.resolve();
      },
    };
  }
}

export default ExitCommand;
