import BaseCommand from "./baseCommand";
import {
  OptionsGenerator,
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import Icon from "../../types/icons";
import { getActiveCommandItem } from "../../utils/utils";
import { QueryClient } from "@tanstack/react-query";

class OptionsCommand extends BaseCommand {
  constructor() {
    super("options", "Options", "⚙️", 0, "options", {});
  }

  async getPlaceholderSuggestion(
    queryClient: QueryClient
  ): Promise<Suggestion> {
    return {
      title: "Options",
      description: "View options for this item",
      icon: Icon.Ellipsis,
      id: this.id,
      type: "command",
    };
  }

  async getSuggestions(params: SuggestionsParams): Promise<SuggestionList> {
    const activeCommand = getActiveCommandItem(params.state.commandStack);
    const optionsGenerator = activeCommand?.options?.data as
      | OptionsGenerator
      | undefined;

    if (!optionsGenerator) {
      return {
        items: [
          {
            title: "No options available",
            description: "This item has no additional options",
            icon: Icon.Info,
            id: "no-options",
          },
        ],
      };
    }

    return optionsGenerator(params);
  }
}

export default OptionsCommand;
