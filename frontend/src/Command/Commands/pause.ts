import BaseCommand from "./baseCommand";
import { Suggestion, SuggestionList } from "../../types/command";
import { Window } from "@wailsio/runtime";
import Icon from "../../types/icons";
import { HandleGenericError } from "./utils";
import { Pause } from "../../../bindings/spotlightify-wails/backend/backend";

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
      action: async (actions) => {
        Window.Minimise();
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
