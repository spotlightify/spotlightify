import BaseCommand from "./baseCommand";
import { Suggestion, SuggestionList } from "../../types/command";
import Icon from "../../types/icons";
import { Window } from "@wailsio/runtime";
import icons from "../../types/icons";
import { FullShow } from "../../../bindings/github.com/zmb3/spotify/v2";
import {
  GetShowsByQuery,
  PlayPodcast,
  ShowWindow,
} from "../../../bindings/spotlightify-wails/backend/backend";

class PodcastCommand extends BaseCommand {
  constructor() {
    super("podcast", "Podcast", "podcast", 400, "podcast", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Podcast",
      description: "Play the latest episode of a podcast",
      icon: Icon.Podcast,
      id: this.id,
      action: (actions) => {
        actions.batchActions([
          { type: "SET_PLACEHOLDER_TEXT", payload: "Enter a podcast to play" },
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

    let podcasts = [] as FullShow[];
    try {
      podcasts = await GetShowsByQuery(input);
    } catch (e) {
      suggestions.push({
        title: "Error retrieving podcasts",
        description: String(e),
        icon: Icon.Error,
        id: "no-podcasts-found-error",
      });
      return { items: suggestions };
    }

    if (!podcasts || podcasts.length === 0) {
      suggestions.push({
        title: "No results found",
        description: "No podcasts found for the given query",
        icon: Icon.Error,
        id: "no-podcasts-found-error",
      });
      return { items: suggestions };
    }

    podcasts.forEach((podcast) => {
      suggestions.push({
        title: podcast.name,
        description: podcast.publisher,
        icon: podcast.images[2].url ?? icons.Podcast,
        id: podcast.id,
        action: async (actions) => {
          Window.Minimise();
          actions.resetPrompt();
          try {
            await PlayPodcast(podcast.uri);
          } catch (e) {
            actions.setSuggestionList({
              items: [
                {
                  title: "Error failed to play podcast",
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

export default PodcastCommand;
