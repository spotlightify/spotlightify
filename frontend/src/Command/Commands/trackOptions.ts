import { Suggestion, SuggestionList } from "../../types/command";
import Icon from "../../types/icons";
import { CombinedArtistsString, HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { QueryClient } from "@tanstack/react-query";
import { spotify } from "../../../wailsjs/go/models";
import { PlayRecommendationsFromItem } from "../../../wailsjs/go/backend/Backend";

class TrackOptions extends BaseCommand {
  track: spotify.SimpleTrack;

  constructor(track: spotify.SimpleTrack) {
    super(
      "trackOptions",
      "Track Options",
      "trackOptions",
      0,
      "trackOptions",
      {}
    );
    this.track = track;
  }

  getPlaceholderSuggestion(queryClient: QueryClient): Promise<Suggestion> {
    throw new Error("Method not implemented.");
  }

  async getSuggestions(
    _input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
    return Promise.resolve({
      items: [
        {
          title: `Track: ${this.track.name}`,
          description: `Artists: ${CombinedArtistsString(this.track.artists)}`,
          id: "track-info",
          icon: this.track.album.images[2].url,
        },
        {
          title: "Start Radio",
          description: "Start a radio based on this track",
          id: "start-radio",
          icon: Icon.Radio,
          action: async (actions) => {
            try {
              PlayRecommendationsFromItem(this.track);
            } catch (error) {
              console.log("Error starting radio", error);
              HandleGenericError(
                "Play recommendations",
                error,
                actions.setSuggestionList
              );
            }
          },
        }, // TODO: We currently cannot like/unlike a track since we need a list of liked tracks. This is where caching will come in.
        {
          title: "View Album",
          description: `View the album: ${this.track.album.name}`,
          id: "view-album",
          icon: Icon.Album,
          action: async () => {
            try {
              console.log(`Viewing album: ${this.track.album.name}`);
            } catch (error) {
              console.log("Error viewing album", error);
              // HandleGenericError(error);
            }
          },
        },
        {
          title: "View Artist",
          description: `View the artist: ${this.track.artists[0].name}`,
          id: "view-artist",
          icon: Icon.Artist,
          action: async () => {
            try {
              console.log(`Viewing artist: ${this.track.artists[0].name}`);
            } catch (error) {
              console.log("Error viewing artist", error);
              // HandleGenericError(error);
            }
          },
        },
        {
          title: "Add to Playlist",
          description: "Add this track to a playlist",
          id: "add-to-playlist",
          icon: Icon.Plus,
          action: async () => {
            console.log("Add to Playlist");
          },
        },
      ],
    });
  }
}

export default TrackOptions;
