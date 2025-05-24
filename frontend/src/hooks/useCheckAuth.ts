import { useEffect } from "react";
import { CommandStateItem, SpotlightifyActions } from "../types/command";
import { CheckIfAuthenticatedWithSpotify } from "../../wailsjs/go/backend/Backend";
import AuthenticateCommand from "../Command/Commands/authenticate/authenticate";

interface props {
  actions: SpotlightifyActions;
  commandStack: CommandStateItem[];
}

function useCheckAuth({ actions, commandStack: commandHistory }: props) {
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
