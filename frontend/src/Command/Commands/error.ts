import BaseCommand from "./baseCommand";
import {
  Suggestion,
  SuggestionList,
  SuggestionsParams,
} from "../../types/command";
import Icon from "../../types/icons";

export function CreateError(title: string, suggestions: Suggestion[]) {
  return new ErrorCommand(title, suggestions);
}

class ErrorCommand extends BaseCommand {
  private suggestions: Suggestion[];
  constructor(title: string, suggestions: Suggestion[]) {
    // id, title, shorthandTitle, debounceMS, keyword, parameters
    super("Error", title, "Error", 0, "error", {});
    this.suggestions = suggestions;
  }

  // Never to be invoked
  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return Promise.resolve({
      title: "An Error Occurred",
      description: "Something went wrong",
      icon: Icon.Error, // Use the existing Error icon
      id: this.id,
      type: "command",
      action: () => Promise.resolve(), // No specific action for a generic placeholder
    });
  }

  async getSuggestions(params: SuggestionsParams): Promise<SuggestionList> {
    // User will implement this method
    console.error("ErrorCommand.getSuggestions called with:", params);
    // Return an empty list for now
    return Promise.resolve({ items: this.suggestions });
  }
}

export default ErrorCommand;
