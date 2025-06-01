import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import { HideWindow } from "../../../wailsjs/go/backend/Backend";
import Icon from "../../types/icons";
import {
  ChangeRepeatState,
  GetRepeatState,
} from "../../../wailsjs/go/backend/Backend";
import { executePlaybackAction, HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { QueryClient } from "@tanstack/react-query";

const repeatKey = "isShuffled";

class RepeatCommand extends BaseCommand {
  constructor() {
    super("repeat", "Repeat", "repeat", 0, "repeat", {});
  }

  async getSuggestions({
    queryClient,
  }: SuggestionsParams): Promise<SuggestionList> {
    const suggestions = [] as Suggestion[];
    suggestions.push({
      title: "Off",
      description: "Turn off repeat",
      icon: Icon.Repeat,
      id: "repeat-off",
      action: async (actions) => {
        await executePlaybackAction({
          playbackAction: async () => {
            await ChangeRepeatState("off");
            queryClient.invalidateQueries({ queryKey: [repeatKey] });
          },
          opName: "Repeat Off",
          actions,
          enableDeviceErrorRetry: false,
        });
        return Promise.resolve();
      },
    });

    suggestions.push({
      title: "Context",
      description: "Repeat the current context",
      icon: Icon.Repeat,
      id: "repeat-context",
      action: async (actions) => {
        await executePlaybackAction({
          playbackAction: async () => {
            await ChangeRepeatState("context");
            queryClient.invalidateQueries({ queryKey: [repeatKey] });
          },
          opName: "Repeat Context",
          actions,
          enableDeviceErrorRetry: false,
        });

        return Promise.resolve();
      },
    });

    suggestions.push({
      title: "Track",
      description: "Repeat the current track",
      icon: Icon.Repeat,
      id: "repeat-track",
      action: async (actions) => {
        HideWindow();
        try {
          await ChangeRepeatState("track");
          queryClient.invalidateQueries({ queryKey: [repeatKey] });
          actions.resetPrompt();
        } catch (e) {
          HandleGenericError({
            opName: "Repeat Track",
            error: e,
            actions: actions,
          });
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
      type: "command",
      action: async (actions) => {
        actions.setActiveCommand(this, {
          placeholderText: "Filter repeat modes",
        });
        return Promise.resolve();
      },
    };
  }
}

export default RepeatCommand;
