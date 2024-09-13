import { Suggestion, SuggestionList } from "../../types/command";
import { Hide, Quit } from "../../../wailsjs/runtime";
import Icon from "../../types/icons";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";

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
      action: async (actions) => {
        Hide();
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
