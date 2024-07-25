import { useCallback, useEffect, useState } from "react";
import { Command, SuggestionList } from "../Command/interfaces";
import useDebounce from "./useDebounce";
import { GetSuggestions } from "../../wailsjs/go/backend/Backend";
import { model } from "../../wailsjs/go/models";

const baseUrl = "http://localhost:49264";

interface useSuggestionProps {
  activeCommand: model.Command | undefined;
}

function useSuggestion({ activeCommand }: useSuggestionProps) {
  const [originalSuggestionList, setOriginalSuggestionList] =
    useState<model.SuggestionList>(
      model.SuggestionList.createFrom({
        items: [],
        filter: false,
        static: false,
        errorOccurred: false,
      })
    );

  const [displaySuggestions, setDisplaySuggestions] = useState<
    model.Suggestion[]
  >([]);

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (originalSuggestionList.filter) {
        setDisplaySuggestions(
          originalSuggestionList.items.filter((item) =>
            item.title.includes(input)
          )
        );
        return;
      }

      if (originalSuggestionList.static) {
        return;
      }

      try {
        const newSuggestionList = await GetSuggestions(
          input,
          activeCommand?.id ?? "",
          activeCommand?.parameters ?? {}
        );
        setOriginalSuggestionList(newSuggestionList);
      } catch (error) {
        setDisplaySuggestions([
          model.Suggestion.createFrom({
            title: "An error occurred",
            description: "",
          }),
        ]);
      }
    },
    [
      activeCommand,
      originalSuggestionList.filter,
      originalSuggestionList.static,
    ]
  );

  useEffect(() => {
    setOriginalSuggestionList((prev) => ({
      ...prev,
      filter: false,
      static: false,
      convertValues: prev.convertValues,
    }));
  }, [activeCommand]);

  useEffect;

  useEffect(() => {
    if (
      !activeCommand &&
      (originalSuggestionList.filter || originalSuggestionList.static)
    ) {
      setOriginalSuggestionList((prev) => ({
        ...prev,
        filter: false,
        static: false,
        convertValues: prev.convertValues,
      }));
    } else {
      setDisplaySuggestions(originalSuggestionList.items);
    }
  }, [originalSuggestionList]);

  return {
    suggestions: displaySuggestions,
    fetchSuggestions,
    setSuggestionList: setOriginalSuggestionList,
    errorOccurred: originalSuggestionList.errorOccurred ?? false,
  };
}

export default useSuggestion;
