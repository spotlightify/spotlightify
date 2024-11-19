import { Suggestion, SuggestionList } from "../../types/command";
import { Window } from "@wailsio/runtime";
import Icon from "../../types/icons";
import { Backend } from "../../../bindings/spotlightify-wails/backend";
import { HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { QueryClient } from "@tanstack/react-query";
import {
  ChangeRepeatState,
  GetRepeatState,
} from "../../../bindings/spotlightify-wails/backend/backend";

const repeatKey = "isShuffled";

class RepeatCommand extends BaseCommand {
  constructor() {
    super("repeat", "Repeat", "repeat", 0, "repeat", {});
  }

  getSuggestions(
    input: string,
    parameters: Record<string, string>,
    queryClient: QueryClient
  ): Promise<SuggestionList> {
    const suggestions = [] as Suggestion[];
    suggestions.push({
      title: "Off",
      description: "Turn off repeat",
      icon: Icon.Repeat,
      id: "repeat-off",
      action: async (actions) => {
        Window.Minimise();
        try {
          await ChangeRepeatState("off");
          queryClient.invalidateQueries({ queryKey: [repeatKey] });
          actions.resetPrompt();
        } catch (e) {
          HandleGenericError("Repeat Off", e, actions.setSuggestionList);
        }
        return Promise.resolve();
      },
    });

    suggestions.push({
      title: "Context",
      description: "Repeat the current context",
      icon: Icon.Repeat,
      id: "repeat-context",
      action: async (actions) => {
        Window.Minimise();
        try {
          await ChangeRepeatState("context");
          queryClient.invalidateQueries({ queryKey: [repeatKey] });
          actions.resetPrompt();
        } catch (e) {
          HandleGenericError("Repeat Context", e, actions.setSuggestionList);
        }
        return Promise.resolve();
      },
    });

    suggestions.push({
      title: "Track",
      description: "Repeat the current track",
      icon: Icon.Repeat,
      id: "repeat-track",
      action: async (actions) => {
        Window.Minimise();
        try {
          await ChangeRepeatState("track");
          queryClient.invalidateQueries({ queryKey: [repeatKey] });
          actions.resetPrompt();
        } catch (e) {
          HandleGenericError("Repeat Track", e, actions.setSuggestionList);
        }
        return Promise.resolve();
      },
    });

    return Promise.resolve({ items: suggestions, type: "filter" });
  }

  async getPlaceholderSuggestion(
    queryClient: QueryClient
  ): Promise<Suggestion> {
    let repeatState = "";
    try {
      repeatState = await queryClient.fetchQuery({
        queryFn: GetRepeatState,
        queryKey: [repeatKey],
        staleTime: 5000,
      });
    } catch {
      return {
        title: "Repeat",
        description: "Cannot repeat when no device is active",
        icon: Icon.Repeat,
        id: "repeat-placeholder-error",
      };
    }

    return {
      title: `Repeat ${
        repeatState === "" ? "" : "[" + repeatState.toUpperCase() + "]"
      }`,
      description: "Change repeat state",
      icon: Icon.Repeat,
      id: this.id,
      action: async (actions) => {
        actions.batchActions([
          { type: "SET_PLACEHOLDER_TEXT", payload: "Filter repeat modes" },
          { type: "SET_ACTIVE_COMMAND", payload: { command: this } },
          { type: "SET_PROMPT_INPUT", payload: "" },
        ]);
        return Promise.resolve();
      },
    };
  }
}

export default RepeatCommand;
