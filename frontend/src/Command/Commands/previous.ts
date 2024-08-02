import {Suggestion, SuggestionList} from "../../types/command";
import {Hide, Show} from "../../../wailsjs/runtime";
import Icon from "../../types/icons";
import {Previous, Pause} from "../../../wailsjs/go/backend/Backend";
import {HandleGenericError} from "./utils";
import BaseCommand from "./baseCommand";

class PreviousCommand extends BaseCommand {
  constructor() {
    super("previous", "Previous", "previous", 0, "previous", {});
  }

  getSuggestions(
    input: string,
    parameters: Record<string, string>
  ): Promise<SuggestionList> {
    return Promise.resolve({items: []});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Previous",
      description: "Play the previous track",
      icon: Icon.Backward,
      id: this.id,
      action: async (actions) => {
        Hide();
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
