import BaseCommand from "./baseCommand";
import {Suggestion, SuggestionList} from "../../types/command";
import {Hide, Show} from "../../../wailsjs/runtime";
import Icon from "../../types/icons";
import {Pause} from "../../../wailsjs/go/backend/Backend";
import {HandleGenericError} from "./utils";

class PauseCommand extends BaseCommand {
  constructor() {
    super("pause", "Pause", "pause", 0, "pause", {});
  }

  getSuggestions(
    input: string,
    parameters: Record<string, string>
  ): Promise<SuggestionList> {
    return Promise.resolve({items: []});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Pause",
      description: "Pause the current track",
      icon: Icon.Pause,
      id: this.id,
      action: async (actions) => {
        Hide();
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
