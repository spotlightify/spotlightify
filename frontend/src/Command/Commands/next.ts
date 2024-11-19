import { Suggestion, SuggestionList } from "../../types/command";
import { Window } from "@wailsio/runtime";
import Icon from "../../types/icons";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { Next } from "../../../bindings/spotlightify-wails/backend/backend";

class NextCommand extends BaseCommand {
  constructor() {
    super("next", "Next", "next", 0, "next", {});
  }

  getSuggestions(
    _input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
    return Promise.resolve({ items: [] });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Next",
      description: "Play the next track",
      icon: Icon.Forward,
      id: this.id,
      action: async (actions) => {
        Window.Minimise();
        actions.resetPrompt();
        try {
          await Next();
        } catch (e) {
          HandleGenericError("Next Track", e, actions.setSuggestionList);
        }
        return Promise.resolve();
      },
    };
  }
}

export default NextCommand;
