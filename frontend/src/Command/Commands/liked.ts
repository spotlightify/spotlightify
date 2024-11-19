import { Suggestion, SuggestionList } from "../../types/command";
import { Window } from "@wailsio/runtime";
import Icon from "../../types/icons";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { PlayLiked } from "../../../bindings/spotlightify-wails/backend/backend";

class PlayLikedSongs extends BaseCommand {
  constructor() {
    super("liked_songs", "Liked", "liked", 0, "liked songs", {});
  }

  getSuggestions(
    _input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
    return Promise.resolve({ items: [] });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Liked Songs",
      description: "Plays 50 most recently liked songs in your library",
      icon: Icon.Play,
      id: this.id,
      action: async (actions) => {
        Window.Minimise();
        actions.resetPrompt();
        try {
          await PlayLiked();
        } catch (e) {
          HandleGenericError("Liked", e, actions.setSuggestionList);
        }
        return Promise.resolve();
      },
    };
  }
}

export default PlayLikedSongs;
