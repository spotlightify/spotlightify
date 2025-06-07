import BaseCommand from "./baseCommand";
import {Suggestion, SuggestionList, SuggestionsParams,} from "../../types/command";
import Icon from "../../types/icons";
import {HandleError} from "./utils";
import {SetDisableHide} from "../../../wailsjs/go/backend/Backend";
import {DeveloperOptions} from "../../context/SpotlightifyContext";

class DeveloperCommand extends BaseCommand {
  constructor() {
    super("dev", "Developer Options", "dev", 0, "dev", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Developer Options",
      description: "Toggle developer settings",
      icon: Icon.Cog,
      id: this.id,
      type: "command",
      action: async (actions) => {
        actions.setActiveCommand(this, {
          placeholderText: "Developer Options",
        });
        return Promise.resolve();
      },
    };
  }

  getSuggestions(params: SuggestionsParams): Promise<SuggestionList> {
    let disableHide = params.state.developerOptions.disableHide;
    let disableBlur = params.state.developerOptions.disableBlur;
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
              console.log("disableHide", disableHide);
              SetDisableHide(disableHide);

              // Update the developer options in the application state
              actions.setDeveloperOptions({
                disableHide,
                disableBlur,
              } as DeveloperOptions);
              actions.refreshSuggestions();
            } catch (e) {
              HandleError({
                opName: "Debug logs",
                error: e,
                actions: actions,
              });
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
              HandleError({
                opName: "Config logs",
                error: e,
                actions: actions,
              });
            }
            return Promise.resolve();
          },
        },
      ],
    });
  }
}

export default DeveloperCommand;
