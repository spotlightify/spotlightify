import { Suggestion, SuggestionList } from "../../types/command";
import { Hide } from "../../../wailsjs/runtime";
import Icon from "../../types/icons";
import {
  GetDevices,
  SetActiveDevice,
} from "../../../wailsjs/go/backend/Backend";
import { DeviceIconSelector, HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { spotify } from "../../../wailsjs/go/models";
import { QueryClient } from "@tanstack/react-query";

class DeviceCommand extends BaseCommand {
  constructor() {
    super("device", "Device", "device", 0, "device", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Device",
      description: "Control device settings",
      icon: Icon.Device,
      id: this.id,
      action: async (actions) => {
        actions.batchActions([
          { type: "SET_PLACEHOLDER_TEXT", payload: "Select a device" },
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
    const suggestions = [] as Suggestion[];

    let devices: spotify.PlayerDevice[];
    try {
      devices = await GetDevices();
    } catch (e) {
      suggestions.push({
        title: "Error retrieving devices",
        description: String(e),
        icon: Icon.Error,
        id: "could-not-get-devices-error",
      });
      return { items: suggestions };
    }

    if (devices.length === 0) {
      suggestions.push({
        title: "No devices found",
        description: "Make sure Spotify is running on a device",
        icon: Icon.Error,
        id: "no-devices-found-error",
      });
      return { items: suggestions };
    }

    devices.forEach((device) => {
      suggestions.push({
        title: device.name,
        description: device.type,
        icon: DeviceIconSelector(device.type),
        id: device.id,
        action: async (actions) => {
          Hide();
          actions.resetPrompt();
          try {
            await SetActiveDevice(device.id);
            queryClient.invalidateQueries();
          } catch (e) {
            HandleGenericError("Pause", e, actions.setSuggestionList);
          }
          return Promise.resolve();
        },
      });
    });

    return { items: suggestions, type: "filter" };
  }
}

export default DeviceCommand;
