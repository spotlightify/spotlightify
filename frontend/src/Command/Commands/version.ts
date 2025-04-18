import BaseCommand from "./baseCommand";
import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import Icon from "../../types/icons";
import { GetVersion } from "../../../wailsjs/go/backend/Backend";

class VersionCommand extends BaseCommand {
  constructor() {
    super("version", "Version", "v", 500, "version", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Version",
      description: "Show version information",
      icon: Icon.Info,
      id: this.id,
      type: "command",
      action: (actions) => {
        actions.batchActions([
          { type: "SET_PLACEHOLDER_TEXT", payload: "Version information" },
          { type: "SET_ACTIVE_COMMAND", payload: { command: this } },
          { type: "SET_PROMPT_INPUT", payload: "" },
        ]);
        return Promise.resolve();
      },
    };
  }

  async getSuggestions(_params: SuggestionsParams): Promise<SuggestionList> {
    const version = await GetVersion();

    const suggestions: Suggestion[] = [
      {
        title: "Spotlightify",
        description: `Version ${version}`,
        icon: Icon.Info,
        id: "version-info",
      },
    ];

    return { items: suggestions };
  }
}

export default VersionCommand;
