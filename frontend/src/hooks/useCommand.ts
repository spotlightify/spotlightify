import { useCallback, useEffect, useMemo } from "react";
import { CommandRegistry } from "../Command/registery";
import { Command } from "../types/command";
import { useSpotlightify } from "./useSpotlightify";
import PlayCommand from "../Command/Commands/play";
import PauseCommand from "../Command/Commands/pause";
import Queue from "../Command/Commands/queue";
import NextCommand from "../Command/Commands/next";
import PreviousCommand from "../Command/Commands/previous";
import ResumeCommand from "../Command/Commands/resume";
import DeviceCommand from "../Command/Commands/device";
import VolumeCommand from "../Command/Commands/volume";
import AlbumCommand from "../Command/Commands/album";
import LikeCommand from "../Command/Commands/like";
import GotoCommand from "../Command/Commands/goto";
import PlaylistCommand from "../Command/Commands/playlist";
import PodcastCommand from "../Command/Commands/podcast";
import CurrentlyPlayingCommand from "../Command/Commands/currentlyplaying";
import ShuffleCommand from "../Command/Commands/shuffle";
import RepeatCommand from "../Command/Commands/repeat";
import ExitCommand from "../Command/Commands/exit";
import ArtistCommand from "../Command/Commands/artist";

export interface CommandOptions {
  parameters?: Record<string, string>;
  keepPromptOpen?: boolean;
}

export interface CommandHistoryItem {
  command: Command;
  options?: CommandOptions;
}

function useCommand() {
  const { state } = useSpotlightify();
  const { commandHistory, activeCommand } = state;
  const commandRegistry = useMemo(() => new CommandRegistry(), []);

  // Register all commands here
  useEffect(() => {
    if (commandRegistry.getAllCommands().length === 0) {
      // Ensures that commands are only registered once in STRICT Mode
      commandRegistry.register(new PlayCommand());
      commandRegistry.register(new Queue());
      commandRegistry.register(new PlaylistCommand());
      commandRegistry.register(new AlbumCommand());
      commandRegistry.register(new ArtistCommand());
      commandRegistry.register(new PodcastCommand());

      // Playback control commands
      commandRegistry.register(new PauseCommand());
      commandRegistry.register(new ResumeCommand());
      commandRegistry.register(new NextCommand());
      commandRegistry.register(new PreviousCommand());
      commandRegistry.register(new DeviceCommand());
      commandRegistry.register(new VolumeCommand());
      commandRegistry.register(new GotoCommand());
      commandRegistry.register(new ShuffleCommand());
      commandRegistry.register(new RepeatCommand());

      // Misc commands
      commandRegistry.register(new LikeCommand());
      commandRegistry.register(new CurrentlyPlayingCommand());

      commandRegistry.register(new ExitCommand());
    }
  }, []);

  // For displaying on the prompt
  const commandTitles = useMemo(() => {
    const titles = commandHistory.reduce(
      (arr: string[], item, currentIndex) => {
        if (currentIndex === commandHistory.length - 1) {
          return arr;
        }
        arr.push(item.command.shorthandTitle);
        return arr;
      },
      []
    );

    if (activeCommand) {
      titles.push(activeCommand?.command.title);
    }
    return titles;
  }, [activeCommand, commandHistory]);

  const commandSearch = useCallback((input: string) => {
    return commandRegistry.searchByKeyword(input);
  }, []);

  return {
    commandSearch,
    commandTitles,
  };
}

export default useCommand;
