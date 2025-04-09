import { Suggestion, SuggestionList } from "../../types/command";
import { HideWindow } from "../../../wailsjs/go/backend/Backend";
import Icon from "../../types/icons";
import { Resume } from "../../../wailsjs/go/backend/Backend";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";

class ResumeCommand extends BaseCommand {
  constructor() {
    super("resume", "Resume", "resume", 0, "resume", {});
  }

  getSuggestions(
    _input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
    return Promise.resolve({ items: [] });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Resume",
      description: "Resume the current track",
      icon: Icon.Play,
      id: this.id,
      type: "action",
      action: async (actions) => {
        HideWindow();
        actions.resetPrompt();
        try {
          await Resume();
        } catch (e) {
          HandleGenericError("Resume", e, actions.setSuggestionList);
        }
        return Promise.resolve();
      },
    };
  }
}

export default ResumeCommand;
