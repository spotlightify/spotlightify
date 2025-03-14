import BaseCommand from "./baseCommand";
import { Suggestion, SuggestionList } from "../../types/command";
import Icon from "../../types/icons";
import {
  GetTracksByQuery,
  QueueTrack,
  ShowWindow,
} from "../../../wailsjs/go/backend/Backend";
import { Hide } from "../../../wailsjs/runtime";
import icons from "../../types/icons";
import { spotify } from "../../../wailsjs/go/models";
import { CombinedArtistsString, HandleError } from "./utils";

class PlayCommand extends BaseCommand {
  constructor() {
    super("queue", "Queue", "Q", 300, "queue", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Queue",
      description: "Queue a track",
      icon: Icon.Queue,
      id: this.id,
      action: (actions) => {
        actions.batchActions([
          { type: "SET_PLACEHOLDER_TEXT", payload: "Enter a track to queue" },
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
        icon: track.album.images[2].url ?? icons.Track,
        id: track.id,
        action: async (actions) => {
          Hide();
          actions.resetPrompt();
          try {
            await QueueTrack(track.id);
          } catch (e) {
            HandleError("queue", e, actions);
            ShowWindow();
          }
          return Promise.resolve();
        },
      });
    });

    return { items: suggestions };
  }
}

export default PlayCommand;
