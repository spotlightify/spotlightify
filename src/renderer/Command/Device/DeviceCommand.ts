import deviceIcon from 'assets/svg/device.svg';
import { AbstractCommand } from '../Command';
import spotifyApi from '../Spotify';
import { ExecuteAction, SetActiveCommandAction } from '../../Action/Action';
import { SuggestionData } from '../../components/Suggestion/Suggestion';

export default class DeviceCommand extends AbstractCommand {
  constructor() {
    super('Device', ['devices'], 'Device');
  }

  async getSuggestions(
    input: string,
    isActiveCommand: boolean,
  ): Promise<SuggestionData[]> {
    if (!isActiveCommand) {
      return [
        {
          title: 'Devices',
          description: 'Show available devices',
          icon: deviceIcon,
          id: this.id,
          action: {
            type: 'setActiveCommand',
            parentCommandId: this.id,
          } as SetActiveCommandAction,
        },
      ];
    }

    let response;
    try {
      response = await spotifyApi.player.getAvailableDevices();
    } catch (error) {
      return [
        {
          title: 'Error',
          description: 'Failed to fetch devices',
          icon: deviceIcon,
          id: 'error',
          action: {
            type: 'setActiveCommand',
            parentCommandId: this.id,
          } as SetActiveCommandAction,
        },
      ];
    }

    const { devices } = response;

    if (devices.length === 0) {
      return [
        {
          title: 'No devices available',
          description: 'Please open Spotify on a device',
          icon: deviceIcon,
          id: 'no-devices',
          action: {
            type: 'setActiveCommand',
            parentCommandId: this.id,
          } as SetActiveCommandAction,
        },
      ];
    }

    return devices.map((device) => ({
      title: device.name,
      description: device.type,
      icon: deviceIcon,
      id: device.id!,
      action: {
        type: 'execute',
        parentCommandId: this.id,
        payload: async () => {
          spotifyApi.player.transferPlayback([device.id!]); // TODO not sure if this is the correct way to use this endpoint
        },
      } as ExecuteAction,
    }));
  }
}
