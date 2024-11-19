import { Suggestion, SuggestionList } from "../../types/command";
import { Window } from "@wailsio/runtime";
import Icon from "../../types/icons";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { Previous } from "../../../bindings/spotlightify-wails/backend/backend";

class PreviousCommand extends BaseCommand {
  constructor() {
    super("previous", "Previous", "previous", 0, "previous", {});
  }

  getSuggestions(
    _input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
    return Promise.resolve({ items: [] });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Previous",
      description: "Play the previous track",
      icon: Icon.Backward,
      id: this.id,
      action: async (actions) => {
        Window.Minimise();
        actions.resetPrompt();
        try {
          await Previous();
        } catch (e) {
          HandleGenericError("Previous Track", e, actions.setSuggestionList);
        }
        return Promise.resolve();
      },
    };
  }
}

export default PreviousCommand;
