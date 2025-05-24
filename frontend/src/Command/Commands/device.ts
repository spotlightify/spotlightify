import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import { HideWindow } from "../../../wailsjs/go/backend/Backend";
import Icon from "../../types/icons";
import {
  GetDevices,
  SetActiveDevice,
} from "../../../wailsjs/go/backend/Backend";
import { DeviceIconSelector, HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { spotify } from "../../../wailsjs/go/models";
import { QueryClient } from "@tanstack/react-query";

const GetDevicesKey = "getDevices";

class DeviceCommand extends BaseCommand {
  constructor() {
    super("device", "Device", "device", 400, "device", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Device",
      description: "Set the active device and default device for playback",
      icon: Icon.Device,
      id: this.id,
      type: "command",
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

  async getSuggestions({
    input,
    queryClient,
  }: SuggestionsParams): Promise<SuggestionList> {
    const suggestions = [] as Suggestion[];

    let devices: spotify.PlayerDevice[];
    try {
      devices = await queryClient.fetchQuery({
        queryFn: GetDevices,
        queryKey: [GetDevicesKey],
        staleTime: 10000,
      });
    } catch (e) {
      suggestions.push({
        title: "Error retrieving devices",
        description: String(e),
        icon: Icon.Error,
        id: "could-not-get-devices-error",
      });
      return { items: suggestions };
    }

    if (input) {
      devices = devices.filter((device) =>
        device.name.toLowerCase().includes(input.toLowerCase())
      );
    }

    suggestions.push({
      title: "Refresh devices",
      description: "Refresh the list of devices",
      icon: Icon.Refresh,
      id: "refresh-devices",
      action: async (actions) => {
        queryClient.invalidateQueries({
          queryKey: [GetDevicesKey, "suggestions"],
        });
        return Promise.resolve();
      },
    });

    if (devices.length === 0) {
      suggestions.push({
        title: "No devices found",
        description: `${
          input ? "No devices found for " + input + "." : ""
        } Make sure Spotify is running on a device`,
        icon: Icon.Error,
        id: "no-devices-found-error",
      });
      return { items: suggestions };
    }

    devices.forEach((device) => {
      suggestions.push({
        title: device.name + (device.is_active ? " [Active]" : ""),
        description: device.type,
        icon: DeviceIconSelector(device.type),
        id: device.id,
        action: async (actions) => {
          HideWindow();
          actions.resetPrompt();
          try {
            await SetActiveDevice(device.id);
            queryClient.invalidateQueries({ queryKey: [GetDevicesKey] });
          } catch (e) {
            HandleGenericError({
              opName: "Set Active Device",
              error: e,
              setActiveCommand: actions.setActiveCommand,
            });
          }
          return Promise.resolve();
        },
      });
    });

    return { items: suggestions };
  }
}

export default DeviceCommand;
