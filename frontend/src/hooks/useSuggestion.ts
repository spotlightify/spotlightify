import { useCallback, useEffect, useState } from "react";
import { Command, Suggestion, SuggestionList } from "../types/command";
import { useSpotlightify } from "./useSpotlightify";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "../types/icons";

interface useSuggestionProps {
  commandSearch: (input: string) => Command[];
}

function useSuggestion({ commandSearch }: useSuggestionProps) {
  const { state, actions } = useSpotlightify();
  const { activeCommand } = state;
  const { suggestions: originalSuggestionList } = state;

  const [displaySuggestions, setDisplaySuggestions] = useState<Suggestion[]>(
    []
  );

  const queryClient = useQueryClient();

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (originalSuggestionList?.type === "filter") {
        setDisplaySuggestions(
          originalSuggestionList.items.filter((item) =>
            item.title.includes(input)
          )
        );
        return;
      }

      if (originalSuggestionList?.type === "static") {
        return;
      }

      try {
        let newSuggestionList: SuggestionList = { items: [] };
        if (!activeCommand) {
          await Promise.all(
            commandSearch(input).map(async (command) => {
              newSuggestionList.items.push(
                await command.getPlaceholderSuggestion(queryClient)
              );
            })
          );
        } else {
          newSuggestionList = await activeCommand.command.getSuggestions(
            input,
            activeCommand.options?.parameters ?? {},
            queryClient
          );
        }
        actions.setSuggestionList(newSuggestionList);
      } catch (error) {
        setDisplaySuggestions([
          {
            title: "Error occurred",
            description: String(error),
            icon: Icon.Error,
            id: "error",
          },
        ]);
      }
    },
    [activeCommand, originalSuggestionList.type]
  );

  useEffect(() => {
    if (
      !activeCommand &&
      ["filter", "static"].includes(originalSuggestionList?.type ?? "")
    ) {
      actions.setSuggestionList({
        items: [...state.suggestions.items],
      });
    } else {
      setDisplaySuggestions(originalSuggestionList.items);
    }
  }, [originalSuggestionList, activeCommand]);

  return {
    suggestions: displaySuggestions,
    fetchSuggestions,
    errorOccurred: originalSuggestionList?.type === "error",
  };
}

export default useSuggestion;
