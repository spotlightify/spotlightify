import { QueryClient } from "@tanstack/react-query";
import { Command, Suggestion, SuggestionList } from "../../types/command";
// import {QueryClient} from "@tanstack/react-query";

abstract class BaseCommand implements Command {
  debounceMS: number;
  id: string;
  keyword: string;
  parameters: Record<string, string>;
  shorthandTitle: string;
  title: string;

  protected constructor(
    id: string,
    title: string,
    shorthandTitle: string,
    debounceMS: number,
    keyword: string,
    parameters: Record<string, string>
  ) {
    this.id = id;
    this.title = title;
    this.shorthandTitle = shorthandTitle;
    this.debounceMS = debounceMS;
    this.keyword = keyword;
    this.parameters = parameters;
  }

  abstract getPlaceholderSuggestion(
    queryClient: QueryClient
  ): Promise<Suggestion>;

  abstract getSuggestions(
    input: string,
    parameters: Record<string, string>,
    queryClient: QueryClient
  ): Promise<SuggestionList>;
}

export default BaseCommand;
