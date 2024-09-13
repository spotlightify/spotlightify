import BaseCommand from "./baseCommand";
import { Suggestion, SuggestionList } from "../../types/command";
import Icon from "../../types/icons";
import {
  GetPlaylistsByQuery,
  PlayPlaylist,
  ShowWindow,
} from "../../../wailsjs/go/backend/Backend";
import { Hide } from "../../../wailsjs/runtime";
import icons from "../../types/icons";
import { spotify } from "../../../wailsjs/go/models";
class PlaylistCommand extends BaseCommand {
  constructor() {
    super("playlist", "Playlist", "playlist", 400, "playlist", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Playlist",
      description: "Play a playlist",
      icon: Icon.Playlist,
      id: this.id,
      action: (actions) => {
        actions.batchActions([
          { type: "SET_PLACEHOLDER_TEXT", payload: "Enter a playlist to play" },
          { type: "SET_ACTIVE_COMMAND", payload: { command: this } },
          { type: "SET_PROMPT_INPUT", payload: "" },
        ]);
        return Promise.resolve();
      },
    };
  }

  async getSuggestions(
    input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
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
        icon: playlist.images[0].url ?? icons.Playlist,
        id: playlist.id,
        action: async (actions) => {
          Hide();
          actions.resetPrompt();
          try {
            await PlayPlaylist(playlist.uri);
          } catch (e) {
            actions.setSuggestionList({
              items: [
                {
                  title: "Error failed to play playlist",
                  description: String(e),
                  icon: Icon.Error,
                  id: "error",
                },
              ],
            });
            ShowWindow();
          }
          return Promise.resolve();
        },
      });
    });

    return { items: suggestions };
  }
}

export default PlaylistCommand;
