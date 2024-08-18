import {Suggestion, SuggestionList} from "../../types/command";
import {Hide, Show} from "../../../wailsjs/runtime";
import Icon from "../../types/icons";
import {Next, Pause} from "../../../wailsjs/go/backend/Backend";
import {HandleGenericError} from "./utils";
import BaseCommand from "./baseCommand";

class NextCommand extends BaseCommand {
  constructor() {
    super("next", "Next", "next", 0, "next", {});
  }

  getSuggestions(
    input: string,
    parameters: Record<string, string>
  ): Promise<SuggestionList> {
    return Promise.resolve({items: []});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Next",
      description: "Play the next track",
      icon: Icon.Forward,
      id: this.id,
      action: async (actions) => {
        Hide();
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
