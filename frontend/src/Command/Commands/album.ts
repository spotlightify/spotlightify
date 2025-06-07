import BaseCommand from "./baseCommand";
import {Suggestion, SuggestionList, SuggestionsParams,} from "../../types/command";
import Icon from "../../types/icons";
import icons from "../../types/icons";
import {spotify} from "../../../wailsjs/go/models";
import {CombinedArtistsString, executePlaybackAction} from "./utils";
import {GetAlbumsByQuery, PlayAlbum,} from "../../../wailsjs/go/backend/Backend";

class AlbumCommand extends BaseCommand {
  constructor() {
    super("album", "Album", "album", 400, "album", {});
  }

  async getPlaceholderSuggestion(): Promise<Suggestion> {
    return {
      title: "Album",
      description: "Play an album",
      icon: Icon.Album,
      id: this.id,
      type: "command",
      action: (actions) => {
        actions.setActiveCommand(this, {
          placeholderText: "Enter an album to play",
        });
        return Promise.resolve();
      },
    };
  }

  async getSuggestions({input}: SuggestionsParams): Promise<SuggestionList> {
    const suggestions = [] as Suggestion[];

    if (input.length < 2) {
      return Promise.resolve({items: suggestions});
    }

    let albums = [] as spotify.SimpleAlbum[];
    try {
      albums = await GetAlbumsByQuery(input);
    } catch (e) {
      suggestions.push({
        title: "Error retrieving albums",
        description: String(e),
        icon: Icon.Error,
        id: "no-albums-found-error",
      });
      return {items: suggestions};
    }

    if (!albums || albums.length === 0) {
      suggestions.push({
        title: "No results found",
        description: "No albums found for the given query",
        icon: Icon.Error,
        id: "no-albums-found-error",
      });
      return {items: suggestions};
    }

    albums.forEach((album) => {
      suggestions.push({
        title: album.name,
        description: CombinedArtistsString(album.artists),
        icon: album.images[2].url ?? icons.Album,
        id: album.id,
        action: async (actions) => {
          await executePlaybackAction({
            playbackAction: () => PlayAlbum(album.uri),
            opName: "Play Album",
            actions,
          });
          return Promise.resolve();
        },
      });
    });

    return {items: suggestions};
  }
}

export default AlbumCommand;
