import BaseCommand from "./baseCommand";
import {Suggestion, SuggestionList, SuggestionsParams,} from "../../types/command";
import Icon from "../../types/icons";
import icons from "../../types/icons";
import {GetTracksByQuery, PlayTrack,} from "../../../wailsjs/go/backend/Backend";
import {spotify} from "../../../wailsjs/go/models";
import {CombinedArtistsString, executePlaybackAction} from "./utils";

class PlayCommand extends BaseCommand {
  constructor() {
    super("play", "Play", "play", 400, "play", {});
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

  async getSuggestions({input}: SuggestionsParams): Promise<SuggestionList> {
    const suggestions = [] as Suggestion[];

    if (input.length < 2) {
      return Promise.resolve({items: suggestions});
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
      return {items: suggestions};
    }

    if (!tracks || tracks.length === 0) {
      suggestions.push({
        title: "No results found",
        description: "No tracks found for the given query",
        icon: Icon.Error,
        id: "no-tracks-found-error",
      });
      return {items: suggestions};
    }

    tracks.forEach((track) => {
      suggestions.push({
        title: track.name,
        description: CombinedArtistsString(track.artists),
        icon: track.album.images[2].url ?? icons.Track,
        id: track.id,
        action: async (actions) => {
          await executePlaybackAction({
            playbackAction: async () => await PlayTrack(track.uri),
            opName: "Play Track",
            actions,
          });
          return Promise.resolve();
        },
      });
    });

    return {items: suggestions};
  }
}

export default PlayCommand;
