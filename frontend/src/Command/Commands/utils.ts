import { spotify } from "../../../wailsjs/go/models";
import { Command, SpotlightifyActions } from "../../types/command";
import Icon, { SVGIcon } from "../../types/icons";
import { HideWindow, ShowWindow } from "../../../wailsjs/go/backend/Backend";
import { CreateError } from "./error";
import AuthenticateCommand from "./authenticate/authenticate";
import DeviceCommand from "./device";
import SimpleArtist = spotify.SimpleArtist;

// TODO: at some point, we should probably move this to the backend for efficiency
export function CombinedArtistsString(artists: SimpleArtist[]): string {
  if (artists.length === 0) return "";
  if (artists.length === 1) return artists[0].name;
  if (artists.length === 2) return `${artists[0].name} and ${artists[1].name}`;

  const allButLast = artists
    .slice(0, -1)
    .map((a) => a.name)
    .join(", ");
  const last = artists[artists.length - 1].name;
  return `${allButLast} and ${last}`;
}

export async function HandleError({
  opName,
  error,
  actions,
  callbackRetryAction,
}: {
  opName: string;
  error: unknown;
  actions: SpotlightifyActions;
  callbackRetryAction?: () => Promise<void>;
}) {
  // Check for specific error patterns first
  if (callbackRetryAction) {
    const specificErrorCommand = HandleSpecificError(
      opName,
      error,
      callbackRetryAction
    );
    if (specificErrorCommand) {
      actions.pushCommand(specificErrorCommand);
      await ShowWindow();
      return;
    }
  }

  // Fall back to generic error handling
  const errorCommand = CreateError(`${opName} error`, [
    {
      title: `${opName} error`,
      description: String(error),
      icon: Icon.Error,
      id: `${opName}-error`,
    },
    {
      title: "Dismiss",
      description: "Dismiss the error",
      icon: Icon.BackNav,
      id: `${opName}-dismiss`,
      action: async (actions) => {
        actions.resetPrompt();
        return Promise.resolve();
      },
    },
  ]);

  actions.pushCommand(errorCommand);
  await ShowWindow();
}

export function DeviceIconSelector(deviceType: string): SVGIcon {
  switch (deviceType) {
    case "Computer":
      return Icon.Computer;
    case "Smartphone":
      return Icon.Smartphone;
    case "Speaker":
      return Icon.Speaker;
    default:
      return Icon.Device;
  }
}

export function HandleSpecificError(
  opName: string,
  error: unknown,
  callbackRetryAction: () => Promise<void>
): Command | null {
  const errorMessage = String(error);

  switch (true) {
    case errorMessage.includes("token expired"):
      return CreateError("Session expired", [
        {
          title: "Re-authenticate with Spotify",
          description: "Click here to re-authenticate with Spotify",
          icon: Icon.SpotifyLogo,
          id: "reauth",
          action: async (actions) => {
            actions.setActiveCommand(new AuthenticateCommand());
          },
        },
        {
          title: "Dismiss",
          description: "Dismiss the error",
          icon: Icon.BackNav,
          id: "reauth-dismiss",
          action: async (actions) => {
            actions.popCommand({
              restorePromptInput: true,
            });
            return Promise.resolve();
          },
        },
      ]);

    case errorMessage.includes("No active device found"):
    case errorMessage.includes("Device not found"):
      return CreateError("No active device", [
        {
          title: "Select device",
          description: "Select the device which you want to control Spotify on",
          icon: Icon.Device,
          id: "device",
          action: async (actions) => {
            actions.replaceActiveCommand(
              new DeviceCommand(async () => {
                try {
                  await callbackRetryAction();
                  await HideWindow();
                  actions.resetPrompt();
                } catch (retryError) {
                  await HandleError({
                    opName,
                    error: retryError,
                    actions,
                  });
                }
              }),
              {
                keepPromptOpen: true,
              }
            );
          },
        },
        {
          title: "Dismiss",
          description: "Dismiss the error",
          icon: Icon.BackNav,
          id: "device-dismiss",
          action: async (actions) => {
            actions.popCommand({
              restorePromptInput: true,
            });
            return Promise.resolve();
          },
        },
      ]);

    case errorMessage.includes("Restriction violated"):
      return CreateError("Error", [
        {
          title: "Action not allowed",
          description:
            "This is likely due to Spotify's state not allowing the action to be performed",
          icon: Icon.Error,
          id: "restriction-error",
        },
        {
          title: "Dismiss",
          description: "Dismiss the error",
          icon: Icon.BackNav,
          id: "restriction-dismiss",
          action: async (actions) => {
            actions.popCommand({
              restorePromptInput: true,
            });
            return Promise.resolve();
          },
        },
      ]);

    // Add more specific error cases as needed
    default:
      return null;
  }
}

/**
 * Executes a playback action with standardized error handling and UI flow.
 * This utility function encapsulates the common pattern used across playback commands:
 * 1. Hide the window
 * 2. Execute the playback action
 * 3. Reset the prompt on success
 * 4. Handle errors with optional device error retry logic
 *
 * @param playbackAction - The async function to execute (e.g., PlayTrack, QueueTrack, etc.)
 * @param opName - The operation name for error messages (e.g., "Play Track", "Queue Track")
 * @param actions - The SpotlightifyActions object for UI control
 */
export async function executePlaybackAction({
  playbackAction,
  opName,
  actions,
}: {
  playbackAction: () => Promise<void>;
  opName: string;
  actions: SpotlightifyActions;
}): Promise<void> {
  await HideWindow();

  try {
    await playbackAction();
    actions.resetPrompt();
  } catch (e) {
    await HandleError({
      opName,
      error: e,
      actions,
      callbackRetryAction: playbackAction,
    });
    await ShowWindow();
  }
}
