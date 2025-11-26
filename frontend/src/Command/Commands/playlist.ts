import BaseCommand from "./baseCommand";
import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import Icon from "../../types/icons";
import icons from "../../types/icons";
import {
  GetPlaylistsByQuery,
  PlayPlaylist,
} from "../../../wailsjs/go/backend/Backend";
import { spotify } from "../../../wailsjs/go/models";
import { executePlaybackAction, getSafeImageUrl } from "./utils";

class PlaylistCommand extends BaseCommand {
  constructor() {
    super("playlist", "Playlist", "📝", 400, "playlist", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Playlist",
      description: "Play a playlist",
      icon: Icon.Playlist,
      id: this.id,
      type: "command",
      action: (actions) => {
        actions.setActiveCommand(this, {
          placeholderText: "Enter a playlist to play",
        });
        return Promise.resolve();
      },
    };
  }

  async getSuggestions({ input }: SuggestionsParams): Promise<SuggestionList> {
    const suggestions = [] as Suggestion[];

    if (input.length < 2) {
      return { items: suggestions };
    }

    let playlists = [] as spotify.SimplePlaylist[];
    try {
      playlists = await GetPlaylistsByQuery(input);
    } catch (e) {
      suggestions.push({
        title: "Error retrieving playlists",
        description: String(e),
        icon: Icon.Error,
        id: "no-playlists-found-error",
      });
      return { items: suggestions };
    }

    if (!playlists || playlists.length === 0) {
      suggestions.push({
        title: "No results found",
        description: "No playlists found for the given query",
        icon: Icon.Error,
        id: "no-playlists-found-error",
      });
      return { items: suggestions };
    }

    playlists.forEach((playlist) => {
      suggestions.push({
        title: playlist.name,
        description: `By ${playlist.owner.display_name}`,
        icon: getSafeImageUrl(playlist.images, 0, icons.Playlist),
        id: playlist.id,
        action: async (actions) => {
          await executePlaybackAction({
            playbackAction: () => PlayPlaylist(playlist.uri),
            opName: "Play Playlist",
            actions,
          });
          return Promise.resolve();
        },
      });
    });

    return { items: suggestions };
  }
}

export default PlaylistCommand;
