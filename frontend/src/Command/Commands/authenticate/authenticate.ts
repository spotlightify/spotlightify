import {
  AuthenticateWithSpotify,
  CloseAuthServer,
  GetClientID,
  GetClientSecret,
  HideWindow,
} from "../../../../wailsjs/go/backend/Backend";
import { BrowserOpenURL, Quit } from "../../../../wailsjs/runtime/runtime";
import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../../types/command";
import Icon from "../../../types/icons";
import BaseCommand from "../baseCommand";
import { HandleError } from "../utils";
import ClientIDCommand from "./client_id";
import ClientSecretCommand from "./client_secret";

class AuthenticateCommand extends BaseCommand {
  private firstTime: boolean = false;

  constructor(firstTime?: boolean) {
    super("auth", "Authenticate", "🔐", 0, "authenticate", {});
    this.firstTime = firstTime ?? false;
  }

  async getSuggestions(_params: SuggestionsParams): Promise<SuggestionList> {
    const openInstructionsSuggestions: Suggestion = {
      title: "Open Instructions",
      description: "Open the instructions in a new browser window",
      icon: Icon.Ellipsis,
      id: "open-instructions",
      action: async (_actions) => {
        BrowserOpenURL("https://spotlightify.petermurph.ie/setup");
      },
    };

    const clientID = await GetClientID();
    const isClientIDSet = clientID !== "";

    const addClientIDSuggestion: Suggestion = {
      title: !isClientIDSet ? "Add Client ID" : "Change Client ID",
      description: !isClientIDSet
        ? "Add your Spotify client ID"
        : "Client ID: " + clientID,
      icon: !isClientIDSet ? Icon.Plus : Icon.Change,
      id: "add-client-id",
      action: async (actions) => {
        actions.batchActions([
          {
            type: "SET_PLACEHOLDER_TEXT",
            payload: "Enter Client ID",
          },
          {
            type: "SET_ACTIVE_COMMAND",
            payload: {
              command: new ClientIDCommand(),
              options: { keepPromptOpen: true, lockCommandStack: true },
            },
          },
          { type: "SET_PROMPT_INPUT", payload: !isClientIDSet ? "" : clientID },
        ]);
        return Promise.resolve();
      },
    };

    const clientSecret = await GetClientSecret();
    const isClientSecretSet = clientSecret !== "";

    const addClientSecretSuggestion: Suggestion = {
      title: !isClientSecretSet ? "Add Client Secret" : "Change Client Secret",
      description: !isClientSecretSet
        ? "Add your Spotify client Secret"
        : "Client Secret: " + clientSecret,
      icon: !isClientSecretSet ? Icon.Plus : Icon.Change,
      id: "add-client-secret",
      action: async (actions) => {
        actions.batchActions([
          {
            type: "SET_PLACEHOLDER_TEXT",
            payload: "Enter Client Secret",
          },
          {
            type: "SET_PROMPT_INPUT",
            payload: !isClientSecretSet ? "" : clientSecret,
          },
          {
            type: "SET_ACTIVE_COMMAND",
            payload: {
              command: new ClientSecretCommand(),
              options: { keepPromptOpen: true, lockCommandStack: true },
            },
          },
        ]);
        return Promise.resolve();
      },
    };

    const authenticateSuggestion: Suggestion = {
      title: "Authenticate",
      description: "Authenticate with Spotify",
      icon: Icon.SpotifyLogo,
      id: "authenticate",
      action: async (actions) => {
        try {
          await AuthenticateWithSpotify();
        } catch (e) {
          HandleError({
            opName: "spotify authentication",
            error: e,
            actions: actions,
          });
          return;
        }
      },
    };

    const items = [
      openInstructionsSuggestions,
      addClientIDSuggestion,
      addClientSecretSuggestion,
      authenticateSuggestion,
    ];

    if (this.firstTime) {
      const exitSuggestion: Suggestion = {
        title: "Exit",
        description: "Exit spotlightify",
        icon: Icon.Exit,
        id: "exit-auth-menu",
        action: async (actions) => {
          HideWindow();
          actions.resetPrompt();
          try {
            await Quit();
          } catch (e) {
            HandleError({
              opName: "Exit",
              error: e,
              actions: actions,
            });
          }
          return Promise.resolve();
        },
      };
      items.push(exitSuggestion);
    }

    return Promise.resolve({
      items: items,
      // type: "static",
    });
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Authenticate",
      description: "Autneticate with Spotify",
      icon: Icon.SpotifyLogo,
      id: this.id,
      type: "command",
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

  onCancel() {
    CloseAuthServer();
  }
}

export default AuthenticateCommand;
