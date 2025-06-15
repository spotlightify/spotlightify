import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import { ClipboardSetText } from "../../../wailsjs/runtime";
import Icon from "../../types/icons";
import { GetCurrentlyPlayingTrack } from "../../../wailsjs/go/backend/Backend";
import { CombinedArtistsString, HandleError, getSafeImageUrl } from "./utils";
import BaseCommand from "./baseCommand";
import { backend } from "../../../wailsjs/go/models";

class CurrentlyPlayingCommand extends BaseCommand {
  constructor() {
    super(
      "currentlyplaying",
      "Currently Playing",
      "currentlyplaying",
      0,
      "currentlyplaying",
      {}
    );
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Currently Playing",
      description: "View currently playing track",
      icon: Icon.Play,
      id: this.id,
      type: "command",
      action: async (actions) => {
        actions.setActiveCommand(this, {
          placeholderText: "Currently Playing track",
        });
        return Promise.resolve();
      },
    };
  }

  async getSuggestions({
    parameters,
    queryClient,
  }: SuggestionsParams): Promise<SuggestionList> {
    const suggestions = [] as Suggestion[];

    let currentlyPlaying: backend.CurrentlyPlayingTrack;
    try {
      currentlyPlaying = await queryClient.fetchQuery({
        queryKey: ["currentlyPlaying"],
        queryFn: GetCurrentlyPlayingTrack,
        staleTime: 10000,
      });
    } catch (e) {
      suggestions.push({
        title: "Error retrieving currently playing track",
        description: String(e),
        icon: Icon.Error,
        id: "could-not-get-currently-playing-error",
      });
      return { items: suggestions };
    }

    if (!currentlyPlaying || !currentlyPlaying.item) {
      suggestions.push({
        title: "No track currently playing",
        description: "Start playing a track on Spotify",
        icon: Icon.Error,
        id: "no-track-currently-playing-error",
      });
      return { items: suggestions };
    }

    const track = currentlyPlaying.item;
    suggestions.push({
      title: track.name,
      description: CombinedArtistsString(track.artists),
      icon: getSafeImageUrl(track.album.images, 2, Icon.Track),
      id: track.id,
    });

    const isShared = parameters.shared === "true";
    suggestions.push({
      title: `Share ${isShared ? "- Copied to Clipboard!" : ""}`,
      description: "Copy track URL to clipboard",
      icon: Icon.Share,
      id: "share",
      action: async (actions) => {
        try {
          const trackUrl = track.external_urls.spotify;
          if (!trackUrl) {
            throw new Error("No Spotify URL available for this track");
          }
          await ClipboardSetText(trackUrl);
          actions.setCurrentCommandParameters({ shared: "true" });
        } catch (e) {
          await HandleError({
            opName: "Copy to clipboard",
            error: e,
            actions: actions,
          });
        }
      },
    });

    return { items: suggestions };
  }
}

export default CurrentlyPlayingCommand;
