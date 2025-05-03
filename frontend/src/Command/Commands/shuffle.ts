import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import { HideWindow } from "../../../wailsjs/go/backend/Backend";
import Icon from "../../types/icons";
import { ChangeShuffle, IsShuffled } from "../../../wailsjs/go/backend/Backend";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { QueryClient } from "@tanstack/react-query";

const shuffleKey = "isShuffled";

class ShuffleCommand extends BaseCommand {
  constructor() {
    super("shuffle", "Shuffle", "shuffle", 0, "shuffle", {});
  }

  async getSuggestions(_params: SuggestionsParams): Promise<SuggestionList> {
    return Promise.resolve({ items: [] });
  }

  async getPlaceholderSuggestion(
    queryClient: QueryClient
  ): Promise<Suggestion> {
    let isShuffled = false;
    try {
      isShuffled = await queryClient.fetchQuery({
        queryFn: IsShuffled,
        queryKey: [shuffleKey],
        staleTime: 5000,
      });
    } catch (e) {
      return {
        title: "Shuffle",
        description: "Cannot shuffle when no device is active",
        icon: Icon.Shuffle,
        id: "shuffle-placeholder-error",
      };
    }

    return {
      title: `Shuffle ${isShuffled ? "[ON]" : "[OFF]"}`,
      description: isShuffled ? "Turn off shuffle" : "Turn on shuffle",
      icon: isShuffled ? Icon.Shuffle : Icon.ShuffleOff,
      id: this.id,
      type: "action",
      action: async (actions) => {
        HideWindow();
        actions.resetPrompt();
        try {
          try {
            await ChangeShuffle(!isShuffled);
          } catch (e) {
            HandleGenericError({
              opName: "Shuffle Playlist",
              error: e,
              setActiveCommand: actions.setActiveCommand,
            });
          }
          actions.resetPrompt();
          queryClient.resetQueries({ queryKey: [shuffleKey] });
        } catch (e) {
          HandleGenericError({
            opName: "Shuffle Playlist",
            error: e,
            setActiveCommand: actions.setActiveCommand,
          });
        }
        return Promise.resolve();
      },
    };
  }
}

export default ShuffleCommand;
