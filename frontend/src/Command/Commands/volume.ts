import BaseCommand from "./baseCommand";
import { Suggestion, SuggestionList } from "../../types/command";
import { Hide } from "../../../wailsjs/runtime";
import Icon from "../../types/icons";
import { GetVolume, SetVolume } from "../../../wailsjs/go/backend/Backend";
import { HandleGenericError } from "./utils";
import { QueryClient } from "@tanstack/react-query";

const VolumeQueryKey = "volume";

class VolumeCommand extends BaseCommand {
  constructor() {
    super("volume", "Set Volume", "volume", 1, "volume <level>", {
      level: "The volume level (0-100)",
    });
  }

  async getPlaceholderSuggestion(
    queryClient: QueryClient
  ): Promise<Suggestion> {
    const volume = await queryClient.fetchQuery({
      queryKey: [VolumeQueryKey],
      queryFn: GetVolume,
      staleTime: 10000,
    });

    return {
      title: `Volume [${volume}/10]`,
      description: "Set the volume level",
      icon: Icon.Volume,
      id: this.id,
      action: async (actions) => {
        actions.batchActions([
          { type: "SET_PLACEHOLDER_TEXT", payload: "0 - 10" },
          { type: "SET_ACTIVE_COMMAND", payload: { command: this } },
          { type: "SET_PROMPT_INPUT", payload: "" },
        ]);
        return Promise.resolve();
      },
    };
  }

  getSuggestions(
    input: string,
    parameters: Record<string, string>,
    queryClient: QueryClient
  ): Promise<SuggestionList> {
    const volumeNumber = Number(input);
    if (volumeNumber < 0 || volumeNumber > 10 || isNaN(volumeNumber)) {
      return Promise.resolve({
        items: [
          {
            title: "Invalid volume",
            description: "Volume must be between 0 and 10",
            icon: Icon.Error,
            id: "invalid-volume",
          },
        ],
      });
    }

    return Promise.resolve({
      items: [
        {
          title: "Set Volume",
          description: `Set the volume to ${volumeNumber}`,
          icon: Icon.Volume,
          id: this.id,
          action: async (actions) => {
            Hide();
            actions.resetPrompt();
            try {
              await SetVolume(volumeNumber);
            } catch (e) {
              HandleGenericError("Set Volume", e, actions.setSuggestionList);
            }
            queryClient.invalidateQueries({ queryKey: [VolumeQueryKey] });
            return Promise.resolve;
          },
        },
      ],
    });
  }
}

export default VolumeCommand;
