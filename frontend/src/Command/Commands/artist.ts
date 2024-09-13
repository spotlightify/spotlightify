import BaseCommand from "./baseCommand";
import { Suggestion, SuggestionList } from "../../types/command";
import Icon from "../../types/icons";
import { Hide } from "../../../wailsjs/runtime";
import icons from "../../types/icons";
import { spotify } from "../../../wailsjs/go/models";
import {
  GetArtistsByQuery,
  PlayArtistsTopTracks,
  ShowWindow,
} from "../../../wailsjs/go/backend/Backend";

class ArtistCommand extends BaseCommand {
  constructor() {
    super("artist", "Artist", "artist", 400, "artist", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Artist",
      description: "Play an artist",
      icon: Icon.Artist,
      id: this.id,
      action: (actions) => {
        actions.batchActions([
          { type: "SET_PLACEHOLDER_TEXT", payload: "Enter an artist to play" },
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

    let artists = [] as spotify.FullArtist[];
    try {
      artists = await GetArtistsByQuery(input);
    } catch (e) {
      suggestions.push({
        title: "Error retrieving artists",
        description: String(e),
        icon: Icon.Error,
        id: "no-artists-found-error",
      });
      return { items: suggestions };
    }

    if (!artists || artists.length === 0) {
      suggestions.push({
        title: "No results found",
        description: "No artists found for the given query",
        icon: Icon.Error,
        id: "no-artists-found-error",
      });
      return { items: suggestions };
    }

    artists.forEach((artist) => {
      suggestions.push({
        title: artist.name,
        description: artist.genres.join(", "),
        icon: artist.images[2].url ?? icons.Artist,
        id: artist.id,
        action: async (actions) => {
          Hide();
          actions.resetPrompt();
          try {
            await PlayArtistsTopTracks(artist.id);
          } catch (e) {
            actions.setSuggestionList({
              items: [
                {
                  title: "Error failed to play artist",
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

export default ArtistCommand;
