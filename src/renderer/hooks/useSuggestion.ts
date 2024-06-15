import { useCallback, useEffect, useState } from 'react';
import { Command, SuggestionList } from '../Command/interfaces';

const baseUrl = 'http://localhost:5000';

const buildQueryParameters = (input: string, command: Command) => {
  const queryParams = new URLSearchParams();
  queryParams.append('input', input);
  if (!command.parameters) {
    return queryParams;
  }

  Object.keys(command.parameters).forEach((key) => {
    queryParams.append(key, command.parameters![key]);
  });
  return queryParams;
};

const fetchSuggestionsFromBackend = async (
  input: string,
  activeCommand: Command | undefined,
) => {
  let response;
  let data;
  if (activeCommand) {
    const queryParams = buildQueryParameters(input, activeCommand);
    response = await fetch(
      `${baseUrl}/command/${activeCommand.id}/get-suggestions?${queryParams.toString()}`,
    );
    data = await response.json();
  } else {
    response = await fetch(`${baseUrl}/command?search=${input}`);
    data = await response.json();
  }
  return data as SuggestionList;
};

interface useSuggestionProps {
  activeCommand: Command | undefined;
  input: string;
}

function useSuggestion({ activeCommand, input }: useSuggestionProps) {
  const [suggestionList, setSuggestionList] = useState<SuggestionList>({
    items: [],
  });

  let suggestionsToDisplay = suggestionList.items;
  if (suggestionList.filter) {
    suggestionsToDisplay = suggestionList.items.filter((item) =>
      item.title.includes(input),
    );
  }

  // When the active command changes, reset the suggestion list
  useEffect(() => {
    setSuggestionList({ items: [] });
  }, [activeCommand]);

  const fetchSuggestions = useCallback(async () => {
    if (suggestionList.filter || suggestionList.static) {
      return;
    }

    try {
      const newSuggestionList = await fetchSuggestionsFromBackend(
        input,
        activeCommand,
      );
      setSuggestionList(newSuggestionList);
    } catch (error) {
      setSuggestionList({
        items: [
          {
            id: 'generic-backend-error',
            title: 'Error fetching suggestions',
            description:
              'An error occurred while fetching suggestions from the backend.',
          },
        ],
      });
    }
  }, [activeCommand, input, suggestionList.filter, suggestionList.static]);

  return {
    suggestions: suggestionsToDisplay,
    fetchSuggestions,
    setSuggestionList,
    errorOccurred: suggestionList.errorOccurred ?? false,
  };
}

export default useSuggestion;

// TODO implement suggestion fetching using a websocket
// const [socketUrl, setSocketUrl] = useState('ws://localhost:5000/ws');
// const { sendJsonMessage, lastMessage, readyState } = useWebSocket(socketUrl);

// useEffect(() => {
//   if (lastMessage !== null) {
//     setMessageHistory((prev) => prev.concat(lastMessage));
//   }
// }, [lastMessage]);
// const fetchSuggestions = useCallback(
//   (input: string) => {
//     sendJsonMessage({
//       type: 'get-suggestions',
//       input,
//       parameters: activeCommand?.parameters,
//     } as WebsocketGetSuggestionsMessage);
//   },
//   [activeCommand?.parameters, sendJsonMessage],
//
//
