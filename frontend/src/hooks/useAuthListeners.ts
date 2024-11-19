// hook for setting up auth listeners

import { useEffect } from "react";
import { SpotlightifyActions } from "../types/command";
import Icon from "../types/icons";
import { Events } from "@wailsio/runtime";

interface props {
  actions: SpotlightifyActions;
}

function useAuthListeners({ actions }: props) {
  useEffect(() => {
    const cancel = Events.On("auth_success", () => {
      actions.resetPrompt();
      actions.setSuggestionList({
        items: [
          {
            title: "Successfully authenticated with Spotify",
            description: "You can now use all of Spotlightify's functionality",
            icon: Icon.SpotifyLogo,
            id: "spotify-auth-success",
          },
        ],
      });
    });
    return () => cancel();
  }, [actions]);
  useEffect(() => {
    const cancel = Events.On("auth_error", (err: string) => {
      actions.setSuggestionList({
        items: [
          {
            title: "Failed to authenticate with Spotify",
            description: err || "An unknown error occurred",
            icon: Icon.SpotifyLogo,
            id: "spotify-auth-success",
          },
        ],
      });
    });
    return () => cancel();
  }, [actions]);
}

export default useAuthListeners;
