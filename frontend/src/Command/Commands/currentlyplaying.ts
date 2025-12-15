import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import Icon from "../../types/icons";
import { GetCurrentlyPlayingTrack } from "../../../wailsjs/go/backend/Backend";
import { CombinedArtistsString, getSafeImageUrl } from "./utils";
import BaseCommand from "./baseCommand";
import { backend } from "../../../wailsjs/go/models";
import { createTrackOptionsGenerator } from "./trackOptions";

class CurrentlyPlayingCommand extends BaseCommand {
  constructor() {
    super(
      "currentlyplaying",
      "Currently Playing",
      "🎵",
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
    state,
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
    const optionsGenerator = createTrackOptionsGenerator(currentlyPlaying.item);
    const optionSuggestions = await optionsGenerator({
      parameters,
      queryClient,
      state,
    } as SuggestionsParams);

    suggestions.push(...optionSuggestions.items);

    return { items: suggestions };
  }
}

export default CurrentlyPlayingCommand;
