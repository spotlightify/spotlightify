import { AddClientID } from "../../../../wailsjs/go/backend/Backend";
import { Suggestion, SuggestionList } from "../../../types/command";
import Icon from "../../../types/icons";
import BaseCommand from "../baseCommand";

class ClientIDCommand extends BaseCommand {
  constructor() {
    super("client_id", "ClientID", "ClientID:", 0, "authenticate", {});
  }

  getSuggestions(
    input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
    const addClientIDSuggestion: Suggestion = {
      title: "Add Client ID",
      description: `Client ID '${input}'`,
      icon: Icon.Plus,
      id: "open-instructions",
      action: async (actions) => {
        AddClientID(input);
        actions.batchActions([
          {
            type: "SET_PLACEHOLDER_TEXT",
            payload: "Authenticate with Spotify",
          },
          { type: "POP_COMMAND" },
          { type: "SET_PROMPT_INPUT", payload: "" },
        ]);
      },
    };

    const backSuggestion: Suggestion = {
      title: "Back",
      description: "Go back to the authentication menu",
      icon: Icon.BackNav,
      id: "back-client-id",
      action: async (actions) => {
        actions.batchActions([
          {
            type: "SET_PLACEHOLDER_TEXT",
            payload: "Authenticate with Spotify",
          },
          { type: "POP_COMMAND" },
          { type: "SET_PROMPT_INPUT", payload: "" },
        ]);
      },
    };

    return Promise.resolve({
      items: [addClientIDSuggestion, backSuggestion],
    });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Authenticate",
      description: "Autneticate with Spotify",
      icon: Icon.SpotifyLogo,
      id: this.id,
      action: async (actions) => {
        actions.batchActions([
          {
            type: "SET_PLACEHOLDER_TEXT",
            payload: "Authenticate with Spotify",
          },
          {
            type: "SET_ACTIVE_COMMAND",
            payload: { command: this, options: { keepPromptOpen: true } },
          },
          { type: "SET_PROMPT_INPUT", payload: "" },
        ]);
        return Promise.resolve();
      },
    };
  }
}

export default ClientIDCommand;
