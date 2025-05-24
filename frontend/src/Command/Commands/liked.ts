import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import { HideWindow } from "../../../wailsjs/go/backend/Backend";
import Icon from "../../types/icons";
import { PlayLiked } from "../../../wailsjs/go/backend/Backend";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";

class PlayLikedSongs extends BaseCommand {
  constructor() {
    super("liked_songs", "Liked", "liked", 0, "liked songs", {});
  }

  async getSuggestions(_params: SuggestionsParams): Promise<SuggestionList> {
    return Promise.resolve({ items: [] });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Liked Songs",
      description: "Plays 50 most recently liked songs in your library",
      icon: Icon.Play,
      id: this.id,
      type: "action",
      action: async (actions) => {
        HideWindow();
        actions.resetPrompt();
        try {
          await PlayLiked();
        } catch (e) {
          HandleGenericError({
            opName: "Liked",
            error: e,
            setActiveCommand: actions.setActiveCommand,
          });
        }
        return Promise.resolve();
      },
    };
  }
}

export default PlayLikedSongs;
