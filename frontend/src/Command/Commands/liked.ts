import {Suggestion, SuggestionList, SuggestionsParams,} from "../../types/command";
import Icon from "../../types/icons";
import {PlayLiked} from "../../../wailsjs/go/backend/Backend";
import BaseCommand from "./baseCommand";
import {executePlaybackAction} from "./utils";

class PlayLikedSongs extends BaseCommand {
  constructor() {
    super("liked_songs", "Liked", "💚", 0, "liked songs", {});
  }

  async getSuggestions(_params: SuggestionsParams): Promise<SuggestionList> {
    return Promise.resolve({items: []});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Liked Songs",
      description: "Plays 50 most recently liked songs in your library",
      icon: Icon.Play,
      id: this.id,
      type: "action",
      action: async (actions) => {
        await executePlaybackAction({
          playbackAction: () => PlayLiked(),
          opName: "Play Liked",
          actions,
        });
        return Promise.resolve();
      },
    };
  }
}

export default PlayLikedSongs;
