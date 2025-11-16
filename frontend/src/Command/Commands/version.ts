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
    super("version", "Version", "ℹ️", 500, "version", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Version",
      description: "Show version information",
      icon: Icon.Info,
      id: this.id,
      type: "command",
      action: (actions) => {
        actions.setActiveCommand(this, {
          placeholderText: "Version information",
        });
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
