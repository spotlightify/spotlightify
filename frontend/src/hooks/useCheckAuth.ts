import { useEffect } from "react";
import { CommandHistoryItem, SpotlightifyActions } from "../types/command";
import AuthenticateCommand from "../Command/Commands/authenticate/authenticate";
import { CheckIfAuthenticatedWithSpotify } from "../../bindings/spotlightify-wails/backend/backend";

interface props {
  actions: SpotlightifyActions;
  commandHistory: CommandHistoryItem[];
}

function useCheckAuth({ actions, commandHistory }: props) {
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await CheckIfAuthenticatedWithSpotify();
      if (!isAuthenticated && commandHistory.length === 0) {
        actions.batchActions([
          {
            type: "SET_ACTIVE_COMMAND",
            payload: {
              command: new AuthenticateCommand(true),
              options: { lockCommandStack: true, keepPromptOpen: true },
            },
          },
          {
            type: "SET_PLACEHOLDER_TEXT",
            payload: "Authenticate with Spotify",
          },
        ]);
      }
    };
    checkAuth();
  }, [commandHistory]);
}

export default useCheckAuth;
