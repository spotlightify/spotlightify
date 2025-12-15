import {
  OptionsGenerator,
  Suggestion,
  SuggestionsParams,
} from "../../types/command";
import { spotify } from "../../../wailsjs/go/models";
import Icon from "../../types/icons";
import { QueueTrack } from "../../../wailsjs/go/backend/Backend";
import { ClipboardSetText } from "../../../wailsjs/runtime";
import {
  HandleError,
  getSafeImageUrl,
  CombinedArtistsString,
  executePlaybackAction,
} from "./utils";
import { SpotlightifyActions } from "../../types/command";

export function createTrackOptionsGenerator(
  track: spotify.SimpleTrack
): OptionsGenerator {
  return async ({ parameters }: SuggestionsParams) => {
    const options: Suggestion[] = [];

    // 1. Track info - Album art, song name, artists (no action)
    options.push({
      title: track.name,
      description: CombinedArtistsString(track.artists),
      icon: getSafeImageUrl(track.album.images, 2, Icon.Track),
      id: `track-info-${track.id}`,
    });

    // 2. Like (placeholder for non-currently-playing tracks)
    options.push({
      title: "Like (placeholder)",
      description: "Like this track",
      icon: Icon.HeartNoFill,
      id: `like-${track.id}`,
      action: async (actions: SpotlightifyActions) => {
        // Placeholder - LikeCurrentSong only works for currently playing track
        return Promise.resolve();
      },
    });

    // 3. Add to Playlist (placeholder)
    options.push({
      title: "Add to Playlist (placeholder)",
      description: "Add this track to a playlist",
      icon: Icon.Playlist,
      id: `add-to-playlist-${track.id}`,
      action: async (actions: SpotlightifyActions) => {
        // Placeholder
        return Promise.resolve();
      },
    });

    // 4. Share - Copy link to clipboard
    const isShared = parameters.shared === "true";
    options.push({
      title: `Share${isShared ? " - Copied to Clipboard!" : ""}`,
      description: "Copy track URL to clipboard",
      icon: Icon.Share,
      id: `share-${track.id}`,
      action: async (actions: SpotlightifyActions) => {
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

    // 5. Add to Queue
    options.push({
      title: "Add to Queue",
      description: "Add this track to the queue",
      icon: Icon.Queue,
      id: `queue-${track.id}`,
      action: async (actions: SpotlightifyActions) => {
        await executePlaybackAction({
          playbackAction: () => QueueTrack(track.id),
          opName: "Queue Track",
          actions,
        });
        return Promise.resolve();
      },
    });

    // 6. Go to Album (placeholder)
    options.push({
      title: "Go to Album (placeholder)",
      description: `View album: ${track.album.name}`,
      icon: Icon.Album,
      id: `go-to-album-${track.id}`,
      action: async (actions: SpotlightifyActions) => {
        // Placeholder - would need album command
        return Promise.resolve();
      },
    });

    // 7. Go to Artist (placeholder)
    const firstArtist = track.artists[0];
    options.push({
      title: "Go to Artist (placeholder)",
      description: firstArtist
        ? `View artist: ${firstArtist.name}`
        : "View artist",
      icon: Icon.Artist,
      id: `go-to-artist-${track.id}`,
      action: async (actions: SpotlightifyActions) => {
        // Placeholder - would need artist command
        return Promise.resolve();
      },
    });

    return { items: options };
  };
}
