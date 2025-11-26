import { AddClientSecret } from "../../../../wailsjs/go/backend/Backend";
import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../../types/command";
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

  async getSuggestions({ input }: SuggestionsParams): Promise<SuggestionList> {
    const addClientSecretSuggestion: Suggestion = {
      title: "Add Client Secret",
      description: `Client Secret '${input}'`,
      icon: Icon.Plus,
      id: "open-instructions",
      action: async (actions) => {
        AddClientSecret(input);
        actions.batchActions([{ type: "POP_COMMAND" }]);
      },
    };

    const backSuggestion: Suggestion = {
      title: "Back",
      description: "Go back to the authentication menu",
      icon: Icon.BackNav,
      id: "back-client-secret",
      action: async (actions) => {
        actions.batchActions([{ type: "POP_COMMAND" }]);
      },
    };

    return Promise.resolve({
      items: [addClientSecretSuggestion, backSuggestion],
    });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    // This function is never called but required for interface implementation
    return Promise.resolve({
      title: "",
      description: "",
      icon: "",
      id: this.id,
    });
  }
}

export default ClientSecretCommand;
