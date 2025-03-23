import BaseCommand from "./baseCommand";
import { Suggestion, SuggestionList } from "../../types/command";
import Icon from "../../types/icons";
import { QueryClient } from "@tanstack/react-query";
import { HandleGenericError } from "./utils";
import { SetDisableHide } from "../../../wailsjs/go/backend/Backend";
import { DeveloperOptions } from "../../context/SpotlightifyContext";

// Keep track of the disable hide state (when true, window always shows)
let disableHide = false;
// Keep track of the disable blur/unfocus state (when true, window won't respond to blur events)
let disableBlur = false;

// Define interface for backend methods that will be called
interface BackendInterface {
  SetDisableHide: (disable: boolean) => Promise<void>;
}

class DeveloperCommand extends BaseCommand {
  constructor() {
    super("dev", "Developer Options", "dev", 0, "dev", {});
  }

  // Method to get the current value of disableHide
  getAlwaysShowValue(): boolean {
    return disableHide;
  }

  // Method to get the current value of disableBlur
  getDisableBlurValue(): boolean {
    return disableBlur;
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Developer Options",
      description: "Toggle developer settings",
      icon: Icon.Cog,
      id: this.id,
      type: "command",
      action: async (actions) => {
        actions.batchActions([
          { type: "SET_ACTIVE_COMMAND", payload: { command: this } },
          { type: "SET_PROMPT_INPUT", payload: "" },
        ]);
        return Promise.resolve();
      },
    };
  }

  getSuggestions(
    _input: string,
    _parameters: Record<string, string>,
    _queryClient: QueryClient
  ): Promise<SuggestionList> {
    return Promise.resolve({
      items: [
        {
          title: `Always Show Window: ${disableHide ? "On" : "Off"}`,
          description:
            "Toggle whether the window should remain visible when unfocused",
          icon: Icon.Cog,
          id: "always-show",
          action: async (actions) => {
            try {
              disableHide = !disableHide;
              SetDisableHide(disableHide);

              // Update the developer options in the application state
              actions.setDeveloperOptions({
                disableHide,
                disableBlur,
              } as DeveloperOptions);
              actions.refreshSuggestions();
            } catch (e) {
              HandleGenericError(
                "Toggle Always Show",
                e,
                actions.setSuggestionList
              );
            }
            return Promise.resolve();
          },
        },
        {
          title: `Disable Blur Events: ${disableBlur ? "On" : "Off"}`,
          description:
            "Toggle whether the window should respond to blur/unfocus events",
          icon: Icon.Cog,
          id: "disable-blur",
          action: async (actions) => {
            try {
              disableBlur = !disableBlur;

              // Update the developer options in the application state
              actions.setDeveloperOptions({
                disableHide,
                disableBlur,
              } as DeveloperOptions);
              actions.refreshSuggestions();
            } catch (e) {
              HandleGenericError(
                "Toggle Disable Blur Events",
                e,
                actions.setSuggestionList
              );
            }
            return Promise.resolve();
          },
        },
      ],
    });
  }
}

export default DeveloperCommand;
