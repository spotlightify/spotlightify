import { Suggestion, SuggestionList } from "../../types/command";
import { Window, Application } from "@wailsio/runtime";
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
        Window.Minimise();
        actions.resetPrompt();
        try {
          await Application.Quit();
        } catch (e) {
          HandleGenericError("Exit", e, actions.setSuggestionList);
        }
        return Promise.resolve();
      },
    };
  }
}

export default ExitCommand;
