import { Suggestion, SuggestionList } from "../../types/command";
import { Window } from "@wailsio/runtime";
import Icon from "../../types/icons";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { Resume } from "../../../bindings/spotlightify-wails/backend/backend";

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
      action: async (actions) => {
        Window.Minimise();
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
