import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import Icon from "../../types/icons";
import { ChangeShuffle, IsShuffled } from "../../../wailsjs/go/backend/Backend";
import BaseCommand from "./baseCommand";
import { QueryClient } from "@tanstack/react-query";
import { executePlaybackAction } from "./utils";

const shuffleKey = "isShuffled";

class ShuffleCommand extends BaseCommand {
  constructor() {
    super("shuffle", "Shuffle", "🔀", 0, "shuffle", {});
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
    } catch {
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
        await executePlaybackAction({
          playbackAction: async () => {
            await ChangeShuffle(!isShuffled);
            queryClient.resetQueries({ queryKey: [shuffleKey] });
          },
          opName: "Toggle Shuffle",
          actions,
        });
        return Promise.resolve();
      },
    };
  }
}

export default ShuffleCommand;
