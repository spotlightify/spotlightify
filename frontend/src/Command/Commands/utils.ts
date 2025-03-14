import { spotify } from "../../../wailsjs/go/models";
import SimpleArtist = spotify.SimpleArtist;
import { SpotlightifyActions } from "../../types/command";
import Icon, { SVGIcon } from "../../types/icons";
import { ShowWindow } from "../../../wailsjs/go/backend/Backend";
import {
  AlbumCommand,
  ArtistCommand,
  CurrentlyPlayingCommand,
  DeviceCommand,
  ExitCommand,
  GotoCommand,
  LikeCommand,
  NextCommand,
  PauseCommand,
  PlayCommand,
  PlaylistCommand,
  PodcastCommand,
  PreviousCommand,
  QueueCommand,
  RepeatCommand,
  ResumeCommand,
  ShuffleCommand,
  VersionCommand,
  VolumeCommand,
} from "./index";
import BaseCommand from "./baseCommand";
import AuthenticateCommand from "./authenticate/authenticate";

type AppError = {
  title: string;
  description: string;
  command?: string;
  icon?: string;
  parameters?: Record<string, string>;
};

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

const commandFactory: Record<string, () => BaseCommand> = {
  device: () => new DeviceCommand(),
  exit: () => new ExitCommand(),
  next: () => new NextCommand(),
  pause: () => new PauseCommand(),
  play: () => new PlayCommand(),
  previous: () => new PreviousCommand(),
  repeat: () => new RepeatCommand(),
  shuffle: () => new ShuffleCommand(),
  version: () => new VersionCommand(),
  volume: () => new VolumeCommand(),
  like: () => new LikeCommand(),
  queue: () => new QueueCommand(),
  playlist: () => new PlaylistCommand(),
  album: () => new AlbumCommand(),
  artist: () => new ArtistCommand(),
  podcast: () => new PodcastCommand(),
  likedSongs: () => new LikeCommand(),
  goto: () => new GotoCommand(),
  resume: () => new ResumeCommand(),
  currentlyPlaying: () => new CurrentlyPlayingCommand(),
  authenticate: () => new AuthenticateCommand(),
};

const commandIconFactory = (icon: string): SVGIcon => {
  const iconName = icon.charAt(0).toUpperCase() + icon.slice(1).toLowerCase();
  return Icon[iconName as keyof typeof Icon] || Icon.Error;
};

function createCommand(commandId: string): BaseCommand | null {
  if (commandId in commandFactory) {
    return commandFactory[commandId]();
  }
  return null;
}

export function HandleError(
  opName: string,
  error: unknown,
  actions: SpotlightifyActions
) {
  let errorTitle: string = `${opName} error`;
  let errorDescription: string;
  let errorCommand: string | undefined;
  let errorParams: Record<string, string> | undefined;
  if (typeof error === "object" && error && "title" in error) {
    const appError = error as AppError;
    errorTitle = appError.title || errorTitle;
    errorDescription = appError.description || String(error);
    errorCommand = appError.command;
    errorParams = appError.parameters;
  } else {
    errorDescription = String(error);
  }

  actions.setSuggestionList({
    items: [
      {
        title: errorTitle,
        description: errorDescription,
        icon: commandIconFactory(errorCommand || "error"),
        id: errorCommand || `${opName}-error`,
        action: async () => {
          if (errorCommand) {
            actions.setActiveCommand(createCommand(errorCommand), {
              parameters: errorParams,
            });
          }
          return Promise.resolve();
        },
      },
    ],
  });
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

/**
 * Extracts the action type and URI from parameters
 * @param parameters - Record containing action parameters
 * @returns An object with the action type and URI
 */
export function extractActionAndURI(parameters: Record<string, string>): {
  actionType: string;
  uri: string;
} {
  // Find the first key that's not a special parameter (like 'shared')
  // This key is assumed to be the action type
  const actionType =
    Object.keys(parameters).find(
      (key) =>
        key !== "shared" &&
        key !== "keepPromptOpen" &&
        key !== "lockCommandStack"
    ) || "";

  // The value associated with the action type key is the URI
  const uri = actionType ? parameters[actionType] : "";

  return { actionType, uri };
}
