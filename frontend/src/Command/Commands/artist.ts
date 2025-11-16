import BaseCommand from "./baseCommand";
import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import Icon from "../../types/icons";
import icons from "../../types/icons";
import { spotify } from "../../../wailsjs/go/models";
import {
  GetArtistsByQuery,
  PlayArtistsTopTracks,
} from "../../../wailsjs/go/backend/Backend";
import { executePlaybackAction, getSafeImageUrl } from "./utils";

class ArtistCommand extends BaseCommand {
  constructor() {
    super("artist", "Artist", "🎤", 400, "artist", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Artist",
      description: "Play an artist",
      icon: Icon.Artist,
      id: this.id,
      type: "command",
      action: (actions) => {
        actions.setActiveCommand(this, {
          placeholderText: "Enter an artist to play",
        });
        return Promise.resolve();
      },
    };
  }

  async getSuggestions({ input }: SuggestionsParams): Promise<SuggestionList> {
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
        icon: getSafeImageUrl(artist.images, 2, icons.Artist),
        id: artist.id,
        action: async (actions) => {
          await executePlaybackAction({
            playbackAction: () => PlayArtistsTopTracks(artist.id),
            opName: "Play Artist",
            actions,
          });
          return Promise.resolve();
        },
      });
    });

    return { items: suggestions };
  }
}

export default ArtistCommand;
