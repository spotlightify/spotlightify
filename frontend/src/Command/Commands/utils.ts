import { spotify } from "../../../wailsjs/go/models";
import SimpleArtist = spotify.SimpleArtist;
import { Command, SuggestionList } from "../../types/command";
import Icon, { SVGIcon } from "../../types/icons";
import { ShowWindow } from "../../../wailsjs/go/backend/Backend";
import { CreateError } from "./error";

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

export function HandleGenericError({
  opName,
  error,
  setActiveCommand,
}: {
  opName: string;
  error: unknown;
  setActiveCommand: (command: Command) => void;
}) {
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

  setActiveCommand(errorCommand);
  ShowWindow();
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
