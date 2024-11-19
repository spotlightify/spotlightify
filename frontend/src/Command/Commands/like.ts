import { Suggestion, SuggestionList } from "../../types/command";
import { Window } from "@wailsio/runtime";
import Icon from "../../types/icons";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { QueryClient } from "@tanstack/react-query";
import {
  IsCurrentSongLiked,
  LikeCurrentSong,
} from "../../../bindings/spotlightify-wails/backend/backend";

const isCurrentSongLikedKey = "isCurrentSongLiked";

class LikeCommand extends BaseCommand {
  private isCurrentSongLiked: boolean = false;
  private isFetchingDevices: boolean = false;

  constructor() {
    super("like", "Like", "like", 0, "like", {});
  }

  getSuggestions(
    _input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
    return Promise.resolve({ items: [] });
  }

  async getPlaceholderSuggestion(
    queryClient: QueryClient
  ): Promise<Suggestion> {
    let isCurrentSongLiked = false;
    try {
      isCurrentSongLiked = await queryClient.fetchQuery({
        queryFn: IsCurrentSongLiked,
        queryKey: [isCurrentSongLikedKey],
        staleTime: 5000,
      });
    } catch (e) {
      return {
        title: "Like",
        description: "Cannot like when no track is currently playing",
        icon: Icon.HeartNoFill,
        id: "like-placeholder-error",
      };
    }

    return {
      title: isCurrentSongLiked ? "Unlike" : "Like",
      description: isCurrentSongLiked
        ? "Unlike the current track"
        : "Like the current track",
      icon: isCurrentSongLiked ? Icon.Heart : Icon.HeartNoFill,
      id: this.id,
      action: async (actions) => {
        Window.Minimise();
        actions.resetPrompt();
        try {
          Window.Minimise();
          await LikeCurrentSong(!isCurrentSongLiked);
          queryClient.invalidateQueries({ queryKey: [isCurrentSongLikedKey] });
          actions.resetPrompt();
        } catch (e) {
          HandleGenericError("Like Track", e, actions.setSuggestionList);
        }
        return Promise.resolve();
      },
    };
  }
}

export default LikeCommand;
