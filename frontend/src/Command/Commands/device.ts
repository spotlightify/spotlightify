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

const GetDevicesKey = "getDevices";

class DeviceCommand extends BaseCommand {
  private popCommandOnDeviceSelected: boolean;
  private afterDeviceSelectedCallback: () => void;

  constructor(
    popCommandOnDeviceSelected?: boolean,
    afterDeviceSelectedCallback?: () => void
  ) {
    super("device", "Device", "device", 400, "device", {});
    this.popCommandOnDeviceSelected = popCommandOnDeviceSelected ?? false;
    this.afterDeviceSelectedCallback =
      afterDeviceSelectedCallback ?? (() => {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Device",
      description: "Set the active device and default device for playback",
      icon: Icon.Device,
      id: this.id,
      type: "command",
      action: async (actions) => {
        actions.setActiveCommand(this, {
          placeholderText: "Select a device",
        });
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
      action: async (_actions) => {
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
          try {
            await SetActiveDevice(device.id);
            queryClient.invalidateQueries({ queryKey: [GetDevicesKey] });
            this.afterDeviceSelectedCallback();
          } catch (e) {
            HandleGenericError({
              opName: "Set Active Device",
              error: e,
              actions: actions,
            });
          }

          if (this.popCommandOnDeviceSelected) {
            actions.popCommand({
              restorePromptInput: true,
            });
          } else {
            HideWindow();
            actions.resetPrompt();
          }
          return Promise.resolve();
        },
      });
    });

    return { items: suggestions };
  }
}

export default DeviceCommand;
