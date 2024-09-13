import { AddClientSecret } from "../../../../wailsjs/go/backend/Backend";
import { Suggestion, SuggestionList } from "../../../types/command";
import Icon from "../../../types/icons";
import BaseCommand from "../baseCommand";

class ClientSecretCommand extends BaseCommand {
  constructor() {
    super(
      "client_secret",
      "Client Secret",
      "ClientSecret:",
      0,
      "authenticate",
      {}
    );
  }

  getSuggestions(
    input: string,
    _parameters: Record<string, string>
  ): Promise<SuggestionList> {
    const addClientSecretSuggestion: Suggestion = {
      title: "Add Client Secret",
      description: `Client Secret '${input}'`,
      icon: Icon.Plus,
      id: "open-instructions",
      action: async (actions) => {
        AddClientSecret(input);
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
      id: "back-client-secret",
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
      items: [addClientSecretSuggestion, backSuggestion],
    });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Authenticate",
      description: "Authenticate with Spotify",
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

export default ClientSecretCommand;
