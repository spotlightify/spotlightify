// hook for setting up auth listeners

import { useEffect } from "react";
import { SpotlightifyActions, SuggestionList } from "../types/command";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import Icon from "../types/icons";

interface props {
  actions: SpotlightifyActions;
}

function useAuthListeners({ actions }: props) {
  useEffect(() => {
    const cancel = EventsOn("auth_success", () => {
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
    const cancel = EventsOn("auth_error", (err: string) => {
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
