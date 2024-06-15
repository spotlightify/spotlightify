export type WebsocketGetSuggestionsMessage = {
  type: 'get-suggestions';
  input: string;
  parameters: { [key: string]: string };
};
