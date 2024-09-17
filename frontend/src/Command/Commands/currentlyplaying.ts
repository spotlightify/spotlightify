import { Suggestion, SuggestionList } from "../../types/command";
import { ClipboardSetText } from "../../../wailsjs/runtime";
import Icon from "../../types/icons";
import { GetCurrentlyPlayingTrack } from "../../../wailsjs/go/backend/Backend";
import { CombinedArtistsString, HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { backend } from "../../../wailsjs/go/models";
import { QueryClient } from "@tanstack/react-query";

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
      action: async (actions) => {
        actions.batchActions([
          {
            type: "SET_PLACEHOLDER_TEXT",
            payload: "Currently Playing track",
          },
          { type: "SET_ACTIVE_COMMAND", payload: { command: this } },
          { type: "SET_PROMPT_INPUT", payload: "" },
        ]);
        return Promise.resolve();
      },
    };
  }

  async getSuggestions(
    input: string,
    parameters: Record<string, string>,
    queryClient: QueryClient
  ): Promise<SuggestionList> {
    let suggestions = [] as Suggestion[];

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
      icon: track.album.images[2].url ?? Icon.Track,
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
          HandleGenericError("Copy to clipboard", e, actions.setSuggestionList);
        }
      },
    });

    return { items: suggestions };
  }
}

export default CurrentlyPlayingCommand;
