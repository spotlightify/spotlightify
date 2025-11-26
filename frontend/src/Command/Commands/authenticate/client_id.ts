import { AddClientID } from "../../../../wailsjs/go/backend/Backend";
import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../../types/command";
import Icon from "../../../types/icons";
import BaseCommand from "../baseCommand";

class ClientIDCommand extends BaseCommand {
  constructor() {
    super("client_id", "Client ID", "Client ID", 0, "authenticate", {});
  }

  async getSuggestions({ input }: SuggestionsParams): Promise<SuggestionList> {
    const addClientIDSuggestion: Suggestion = {
      title: "Add Client ID",
      description: `Client ID '${input}'`,
      icon: Icon.Plus,
      id: "open-instructions",
      action: async (actions) => {
        AddClientID(input);
        actions.batchActions([{ type: "POP_COMMAND" }]);
      },
    };

    const backSuggestion: Suggestion = {
      title: "Back",
      description: "Go back to the authentication menu",
      icon: Icon.BackNav,
      id: "back-client-id",
      action: async (actions) => {
        actions.batchActions([{ type: "POP_COMMAND" }]);
      },
    };

    return Promise.resolve({
      items: [addClientIDSuggestion, backSuggestion],
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

export default ClientIDCommand;
