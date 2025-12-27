import { useCallback, useEffect, useMemo } from "react";
import { useSpotlightify } from "./useSpotlightify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Suggestion } from "../types/command";
import { CommandRegistry } from "../Command/registery";
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
import SeekCommand from "../Command/Commands/seek";
import PlaylistCommand from "../Command/Commands/playlist";
import PodcastCommand from "../Command/Commands/podcast";
import CurrentlyPlayingCommand from "../Command/Commands/currentlyplaying";
import ShuffleCommand from "../Command/Commands/shuffle";
import RepeatCommand from "../Command/Commands/repeat";
import ExitCommand from "../Command/Commands/exit";
import ArtistCommand from "../Command/Commands/artist";
import AuthenticateCommand from "../Command/Commands/authenticate/authenticate";
import PlayLikedSongs from "../Command/Commands/liked";
import VersionCommand from "../Command/Commands/version";
import DeveloperCommand from "../Command/Commands/developer";
import { isDevelopmentMode } from "../utils/devMode";
import useSetWindowSize from "./useSetWindowSize";
import { getActiveCommandItem } from "../utils";

interface UseCommandProps {
  debouncedInput: string;
}

function useAsyncSuggestionLoader(suggestions: Suggestion[]) {
  const { actions } = useSpotlightify();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadersToRun = suggestions.filter(
      (s) => s.asyncLoader && s.isLoading !== false
    );

    loadersToRun.forEach((suggestion) => {
      queryClient.fetchQuery({
        queryKey: ["suggestion-async", suggestion.id],
        queryFn: async ({ signal }) => {
          try {
            const updates = await suggestion.asyncLoader!({
              queryClient,
              signal,
            });

            actions.updateSuggestion(suggestion.id, {
              ...updates,
              isLoading: false,
            });

            return updates;
          } catch (error) {
            actions.updateSuggestion(suggestion.id, {
              isLoading: false,
            });
            throw error;
          }
        },
        staleTime: 30000,
      });
    });

    return () => {
      loadersToRun.forEach((suggestion) => {
        queryClient.cancelQueries({
          queryKey: ["suggestion-async", suggestion.id],
        });
      });
    };
  }, [suggestions, actions, queryClient]);
}

function useCommand({ debouncedInput }: UseCommandProps) {
  const { state, actions } = useSpotlightify();
  const queryClient = useQueryClient();
  const commandRegistry = useMemo(() => new CommandRegistry(), []);
  const { setWindowSize } = useSetWindowSize();
  const activeCommand = getActiveCommandItem(state.commandStack);

  useEffect(() => {
    const registerCommands = async () => {
      if (commandRegistry.getAllCommands().length === 0) {
        // Ensures that commands are only registered once in STRICT Mode
        commandRegistry.register(new PlayCommand());
        commandRegistry.register(new Queue());
        commandRegistry.register(new PlaylistCommand());
        commandRegistry.register(new AlbumCommand());
        commandRegistry.register(new ArtistCommand());
        commandRegistry.register(new PodcastCommand());
        commandRegistry.register(new PlayLikedSongs());

        // Playback control commands
        commandRegistry.register(new PauseCommand());
        commandRegistry.register(new ResumeCommand());
        commandRegistry.register(new NextCommand());
        commandRegistry.register(new PreviousCommand());
        commandRegistry.register(new DeviceCommand());
        commandRegistry.register(new VolumeCommand());
        commandRegistry.register(new SeekCommand());
        commandRegistry.register(new ShuffleCommand());
        commandRegistry.register(new RepeatCommand());

        // Misc commands
        commandRegistry.register(new LikeCommand());
        commandRegistry.register(new CurrentlyPlayingCommand());

        commandRegistry.register(new AuthenticateCommand());

        commandRegistry.register(new ExitCommand());
        commandRegistry.register(new VersionCommand());

        // Check for dev mode and register developer command if needed
        const devMode = await isDevelopmentMode();

        // Only register developer command in dev mode
        if (devMode) {
          console.log("Registering developer command");
          commandRegistry.register(new DeveloperCommand());
        }
      }
    };

    registerCommands();
  }, [commandRegistry]);

  const commandSearch = useCallback(
    (input: string) => {
      return commandRegistry.searchByKeyword(input);
    },
    [commandRegistry]
  );

  // Refactored to return a proper SuggestionList and handle async properly
  const getSuggestions = async () => {
    console.log("getSuggestions");
    const input = debouncedInput;
    const parameters = activeCommand?.options?.parameters || {};

    if (!activeCommand && !input) {
      return { items: [] };
    }

    try {
      if (!activeCommand) {
        const foundCommands = commandSearch(input);
        const suggestions = await Promise.all(
          foundCommands.map((command) =>
            command.getPlaceholderSuggestion(queryClient)
          )
        );
        return { items: suggestions };
      }

      // Get suggestions from the active command
      return (
        (await activeCommand?.command.getSuggestions({
          input,
          parameters,
          queryClient,
          state,
        })) || { items: [] }
      );
    } catch (error) {
      console.error("Error getting suggestions:", error);
      return { items: [] };
    }
  };

  const { data } = useQuery({
    queryKey: [
      "suggestions",
      debouncedInput,
      activeCommand?.command.id,
      activeCommand?.options?.parameters,
    ],
    queryFn: () => getSuggestions(),
  });

  useAsyncSuggestionLoader(state.suggestions.items);

  useEffect(() => {
    if (data) {
      actions.setSuggestionList({ items: data.items });
      setWindowSize({
        width: 650,
        height: 65 + Math.min(8, data.items.length) * 58,
      });
    }
  }, [data, actions]);
}

export default useCommand;
