import BaseCommand from "./baseCommand";
import { Suggestion, SuggestionList } from "../../types/command";
import Icon from "../../types/icons";
import { Hide } from "../../../wailsjs/runtime";
import icons from "../../types/icons";
import { spotify } from "../../../wailsjs/go/models";
import { CombinedArtistsString } from "./utils";
import {
  GetAlbumsByQuery,
  PlayAlbum,
  ShowWindow,
} from "../../../wailsjs/go/backend/Backend";

class AlbumCommand extends BaseCommand {
  constructor() {
    super("album", "Album", "album", 400, "album", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Album",
      description: "Play an album",
      icon: Icon.Album,
      id: this.id,
      action: (actions) => {
        actions.batchActions([
          { type: "SET_PLACEHOLDER_TEXT", payload: "Enter an album to play" },
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
      return Promise.resolve({ items: suggestions });
    }

    let albums = [] as spotify.SimpleAlbum[];
    try {
      albums = await GetAlbumsByQuery(input);
    } catch (e) {
      suggestions.push({
        title: "Error retrieving albums",
        description: String(e),
        icon: Icon.Error,
        id: "no-albums-found-error",
      });
      return { items: suggestions };
    }

    if (!albums || albums.length === 0) {
      suggestions.push({
        title: "No results found",
        description: "No albums found for the given query",
        icon: Icon.Error,
        id: "no-albums-found-error",
      });
      return { items: suggestions };
    }

    albums.forEach((album) => {
      suggestions.push({
        title: album.name,
        description: CombinedArtistsString(album.artists),
        icon: album.images[2].url ?? icons.Album,
        id: album.id,
        action: async (actions) => {
          Hide();
          actions.resetPrompt();
          try {
            await PlayAlbum(album.uri);
          } catch (e) {
            actions.setSuggestionList({
              items: [
                {
                  title: "Error failed to play album",
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

export default AlbumCommand;
