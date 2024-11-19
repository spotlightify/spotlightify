import { Suggestion, SuggestionList } from "../../types/command";
import { Window } from "@wailsio/runtime";
import Icon from "../../types/icons";
import { DeviceIconSelector, HandleGenericError } from "./utils";
import BaseCommand from "./baseCommand";
import { PlayerDevice } from "../../../bindings/github.com/zmb3/spotify/v2/index";
import { QueryClient } from "@tanstack/react-query";
import {
  GetDevices,
  SetActiveDevice,
} from "../../../bindings/spotlightify-wails/backend/backend";

const GetDevicesKey = "getDevices";

class DeviceCommand extends BaseCommand {
  constructor() {
    super("device", "Device", "device", 400, "device", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Device",
      description:
        "Set the active device, will make this the device default for playback through Spotlightify",
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

    let devices: PlayerDevice[];
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
        queryClient.invalidateQueries({ queryKey: [GetDevicesKey] });
        actions.refreshSuggestions();
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
          Window.Minimise();
          actions.resetPrompt();
          try {
            await SetActiveDevice(device.id);
            queryClient.invalidateQueries({ queryKey: [GetDevicesKey] });
          } catch (e) {
            HandleGenericError("Pause", e, actions.setSuggestionList);
          }
          return Promise.resolve();
        },
      });
    });

    return { items: suggestions };
  }
}

export default DeviceCommand;
