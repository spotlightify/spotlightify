import BaseCommand from "./baseCommand";
import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import Icon from "../../types/icons";
import icons from "../../types/icons";
import {
  GetTracksByQuery,
  PlayTrack,
} from "../../../wailsjs/go/backend/Backend";
import { spotify } from "../../../wailsjs/go/models";
import {
  CombinedArtistsString,
  executePlaybackAction,
  getSafeImageUrl,
} from "./utils";
import { createTrackOptionsGenerator } from "./trackOptions";

class PlayCommand extends BaseCommand {
  constructor() {
    super("play", "Play", "🎵", 400, "play", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Play",
      description: "Play a track",
      icon: Icon.Play,
      id: this.id,
      type: "command",
      action: (actions) => {
        actions.setActiveCommand(this, {
          placeholderText: "Enter a track to play",
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

    let tracks = [] as spotify.SimpleTrack[];
    try {
      tracks = await GetTracksByQuery(input);
    } catch (e) {
      suggestions.push({
        title: "Error retrieving tracks",
        description: String(e),
        icon: Icon.Error,
        id: "no-tracks-found-error",
      });
      return { items: suggestions };
    }

    if (!tracks || tracks.length === 0) {
      suggestions.push({
        title: "No results found",
        description: "No tracks found for the given query",
        icon: Icon.Error,
        id: "no-tracks-found-error",
      });
      return { items: suggestions };
    }

    tracks.forEach((track) => {
      suggestions.push({
        title: track.name,
        description: CombinedArtistsString(track.artists),
        icon: getSafeImageUrl(track.album.images, 2, icons.Track),
        id: track.id,
        action: async (actions) => {
          await executePlaybackAction({
            playbackAction: async () => await PlayTrack(track.uri),
            opName: "Play Track",
            actions,
          });
          return Promise.resolve();
        },
        options: createTrackOptionsGenerator(track),

        // Example: Progressive loading with asyncLoader
        // Uncomment to enable async loading of higher quality album art:
        isLoading: true,
        loadingText: "Loading album art...",
        asyncLoader: async ({ queryClient }) => {
          // Fetch higher quality album art or additional track details
          const highResIcon = getSafeImageUrl(
            track.album.images,
            0,
            icons.Track
          );

          // Simulate async operation (in real use, this could fetch from API)
          await new Promise((resolve) => setTimeout(resolve, 500));

          return {
            icon: highResIcon,
            description: `${CombinedArtistsString(track.artists)} • ${
              track.album.name
            }`,
          };
        },
      });
    });

    return { items: suggestions };
  }
}

export default PlayCommand;
