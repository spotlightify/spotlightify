export namespace backend {
	
	export class CurrentlyPlayingTrack {
	    item: spotify.SimpleTrack;
	
	    static createFrom(source: any = {}) {
	        return new CurrentlyPlayingTrack(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.item = this.convertValues(source["item"], spotify.SimpleTrack);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace model {
	
	export class ExecuteAction {
	    commandId: string;
	    parameters: {[key: string]: string};
	    waitTillComplete: boolean;
	    closeOnSuccess: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ExecuteAction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.commandId = source["commandId"];
	        this.parameters = source["parameters"];
	        this.waitTillComplete = source["waitTillComplete"];
	        this.closeOnSuccess = source["closeOnSuccess"];
	    }
	}
	export class PromptState {
	    closePrompt?: boolean;
	    setPromptText?: string;
	    preservePromptText?: boolean;
	    freezePrompt?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new PromptState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.closePrompt = source["closePrompt"];
	        this.setPromptText = source["setPromptText"];
	        this.preservePromptText = source["preservePromptText"];
	        this.freezePrompt = source["freezePrompt"];
	    }
	}
	export class CommandProperties {
	    title: string;
	    shorthandTitle: string;
	    debounceMS: number;
	    keepPromptOpen: boolean;
	    placeholderText: string;
	
	    static createFrom(source: any = {}) {
	        return new CommandProperties(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.shorthandTitle = source["shorthandTitle"];
	        this.debounceMS = source["debounceMS"];
	        this.keepPromptOpen = source["keepPromptOpen"];
	        this.placeholderText = source["placeholderText"];
	    }
	}
	export class Command {
	    id: string;
	    name: string;
	    description: string;
	    icon: string;
	    triggerWord: string;
	    parameters?: {[key: string]: string};
	    properties: CommandProperties;
	    promptText?: string;
	
	    static createFrom(source: any = {}) {
	        return new Command(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.icon = source["icon"];
	        this.triggerWord = source["triggerWord"];
	        this.parameters = source["parameters"];
	        this.properties = this.convertValues(source["properties"], CommandProperties);
	        this.promptText = source["promptText"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CommandOptions {
	    pushCommand?: Command;
	    setCommand?: Command;
	    setCurrentCommandParameters?: {[key: string]: string};
	    popCommand: boolean;
	    clearCommandStack: boolean;
	
	    static createFrom(source: any = {}) {
	        return new CommandOptions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pushCommand = this.convertValues(source["pushCommand"], Command);
	        this.setCommand = this.convertValues(source["setCommand"], Command);
	        this.setCurrentCommandParameters = source["setCurrentCommandParameters"];
	        this.popCommand = source["popCommand"];
	        this.clearCommandStack = source["clearCommandStack"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Action {
	    commandOptions?: CommandOptions;
	    promptState?: PromptState;
	    executeAction?: ExecuteAction;
	
	    static createFrom(source: any = {}) {
	        return new Action(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.commandOptions = this.convertValues(source["commandOptions"], CommandOptions);
	        this.promptState = this.convertValues(source["promptState"], PromptState);
	        this.executeAction = this.convertValues(source["executeAction"], ExecuteAction);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	
	export class Suggestion {
	    title: string;
	    description: string;
	    icon: string;
	    id: string;
	    action?: Action;
	
	    static createFrom(source: any = {}) {
	        return new Suggestion(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.description = source["description"];
	        this.icon = source["icon"];
	        this.id = source["id"];
	        this.action = this.convertValues(source["action"], Action);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SuggestionList {
	    items: Suggestion[];
	    filter: boolean;
	    static: boolean;
	    errorOccurred: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SuggestionList(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.items = this.convertValues(source["items"], Suggestion);
	        this.filter = source["filter"];
	        this.static = source["static"];
	        this.errorOccurred = source["errorOccurred"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ExecuteActionOutput {
	    action?: Action;
	    suggestions?: SuggestionList;
	
	    static createFrom(source: any = {}) {
	        return new ExecuteActionOutput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.action = this.convertValues(source["action"], Action);
	        this.suggestions = this.convertValues(source["suggestions"], SuggestionList);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	

}

export namespace spotify {
	
	export class Copyright {
	    text: string;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new Copyright(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.text = source["text"];
	        this.type = source["type"];
	    }
	}
	export class SimpleShow {
	    available_markets: string[];
	    copyrights: Copyright[];
	    description: string;
	    explicit: boolean;
	    external_urls: {[key: string]: string};
	    href: string;
	    id: string;
	    images: Image[];
	    is_externally_hosted?: boolean;
	    languages: string[];
	    media_type: string;
	    name: string;
	    publisher: string;
	    type: string;
	    uri: string;
	
	    static createFrom(source: any = {}) {
	        return new SimpleShow(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.available_markets = source["available_markets"];
	        this.copyrights = this.convertValues(source["copyrights"], Copyright);
	        this.description = source["description"];
	        this.explicit = source["explicit"];
	        this.external_urls = source["external_urls"];
	        this.href = source["href"];
	        this.id = source["id"];
	        this.images = this.convertValues(source["images"], Image);
	        this.is_externally_hosted = source["is_externally_hosted"];
	        this.languages = source["languages"];
	        this.media_type = source["media_type"];
	        this.name = source["name"];
	        this.publisher = source["publisher"];
	        this.type = source["type"];
	        this.uri = source["uri"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ResumePointObject {
	    fully_played: boolean;
	    resume_position_ms: number;
	
	    static createFrom(source: any = {}) {
	        return new ResumePointObject(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fully_played = source["fully_played"];
	        this.resume_position_ms = source["resume_position_ms"];
	    }
	}
	export class Image {
	    height: number;
	    width: number;
	    url: string;
	
	    static createFrom(source: any = {}) {
	        return new Image(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.height = source["height"];
	        this.width = source["width"];
	        this.url = source["url"];
	    }
	}
	export class EpisodePage {
	    audio_preview_url: string;
	    description: string;
	    duration_ms: number;
	    explicit: boolean;
	    external_urls: {[key: string]: string};
	    href: string;
	    id: string;
	    images: Image[];
	    is_externally_hosted: boolean;
	    is_playable: boolean;
	    languages: string[];
	    name: string;
	    release_date: string;
	    release_date_precision: string;
	    resume_point: ResumePointObject;
	    show: SimpleShow;
	    type: string;
	    uri: string;
	
	    static createFrom(source: any = {}) {
	        return new EpisodePage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.audio_preview_url = source["audio_preview_url"];
	        this.description = source["description"];
	        this.duration_ms = source["duration_ms"];
	        this.explicit = source["explicit"];
	        this.external_urls = source["external_urls"];
	        this.href = source["href"];
	        this.id = source["id"];
	        this.images = this.convertValues(source["images"], Image);
	        this.is_externally_hosted = source["is_externally_hosted"];
	        this.is_playable = source["is_playable"];
	        this.languages = source["languages"];
	        this.name = source["name"];
	        this.release_date = source["release_date"];
	        this.release_date_precision = source["release_date_precision"];
	        this.resume_point = this.convertValues(source["resume_point"], ResumePointObject);
	        this.show = this.convertValues(source["show"], SimpleShow);
	        this.type = source["type"];
	        this.uri = source["uri"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Followers {
	    total: number;
	    href: string;
	
	    static createFrom(source: any = {}) {
	        return new Followers(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total = source["total"];
	        this.href = source["href"];
	    }
	}
	export class FullArtist {
	    name: string;
	    id: string;
	    uri: string;
	    href: string;
	    external_urls: {[key: string]: string};
	    popularity: number;
	    genres: string[];
	    followers: Followers;
	    images: Image[];
	
	    static createFrom(source: any = {}) {
	        return new FullArtist(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.id = source["id"];
	        this.uri = source["uri"];
	        this.href = source["href"];
	        this.external_urls = source["external_urls"];
	        this.popularity = source["popularity"];
	        this.genres = source["genres"];
	        this.followers = this.convertValues(source["followers"], Followers);
	        this.images = this.convertValues(source["images"], Image);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SimpleEpisodePage {
	    href: string;
	    limit: number;
	    offset: number;
	    total: number;
	    next: string;
	    previous: string;
	    items: EpisodePage[];
	
	    static createFrom(source: any = {}) {
	        return new SimpleEpisodePage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.href = source["href"];
	        this.limit = source["limit"];
	        this.offset = source["offset"];
	        this.total = source["total"];
	        this.next = source["next"];
	        this.previous = source["previous"];
	        this.items = this.convertValues(source["items"], EpisodePage);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class FullShow {
	    available_markets: string[];
	    copyrights: Copyright[];
	    description: string;
	    explicit: boolean;
	    external_urls: {[key: string]: string};
	    href: string;
	    id: string;
	    images: Image[];
	    is_externally_hosted?: boolean;
	    languages: string[];
	    media_type: string;
	    name: string;
	    publisher: string;
	    type: string;
	    uri: string;
	    episodes: SimpleEpisodePage;
	
	    static createFrom(source: any = {}) {
	        return new FullShow(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.available_markets = source["available_markets"];
	        this.copyrights = this.convertValues(source["copyrights"], Copyright);
	        this.description = source["description"];
	        this.explicit = source["explicit"];
	        this.external_urls = source["external_urls"];
	        this.href = source["href"];
	        this.id = source["id"];
	        this.images = this.convertValues(source["images"], Image);
	        this.is_externally_hosted = source["is_externally_hosted"];
	        this.languages = source["languages"];
	        this.media_type = source["media_type"];
	        this.name = source["name"];
	        this.publisher = source["publisher"];
	        this.type = source["type"];
	        this.uri = source["uri"];
	        this.episodes = this.convertValues(source["episodes"], SimpleEpisodePage);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class PlayerDevice {
	    id: string;
	    is_active: boolean;
	    is_restricted: boolean;
	    name: string;
	    type: string;
	    volume_percent: number;
	
	    static createFrom(source: any = {}) {
	        return new PlayerDevice(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.is_active = source["is_active"];
	        this.is_restricted = source["is_restricted"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.volume_percent = source["volume_percent"];
	    }
	}
	export class PlaylistTracks {
	    href: string;
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new PlaylistTracks(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.href = source["href"];
	        this.total = source["total"];
	    }
	}
	
	export class SimpleArtist {
	    name: string;
	    id: string;
	    uri: string;
	    href: string;
	    external_urls: {[key: string]: string};
	
	    static createFrom(source: any = {}) {
	        return new SimpleArtist(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.id = source["id"];
	        this.uri = source["uri"];
	        this.href = source["href"];
	        this.external_urls = source["external_urls"];
	    }
	}
	export class SimpleAlbum {
	    name: string;
	    artists: SimpleArtist[];
	    album_group: string;
	    album_type: string;
	    id: string;
	    uri: string;
	    available_markets: string[];
	    href: string;
	    images: Image[];
	    external_urls: {[key: string]: string};
	    release_date: string;
	    release_date_precision: string;
	
	    static createFrom(source: any = {}) {
	        return new SimpleAlbum(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.artists = this.convertValues(source["artists"], SimpleArtist);
	        this.album_group = source["album_group"];
	        this.album_type = source["album_type"];
	        this.id = source["id"];
	        this.uri = source["uri"];
	        this.available_markets = source["available_markets"];
	        this.href = source["href"];
	        this.images = this.convertValues(source["images"], Image);
	        this.external_urls = source["external_urls"];
	        this.release_date = source["release_date"];
	        this.release_date_precision = source["release_date_precision"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class User {
	    display_name: string;
	    external_urls: {[key: string]: string};
	    followers: Followers;
	    href: string;
	    id: string;
	    images: Image[];
	    uri: string;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.display_name = source["display_name"];
	        this.external_urls = source["external_urls"];
	        this.followers = this.convertValues(source["followers"], Followers);
	        this.href = source["href"];
	        this.id = source["id"];
	        this.images = this.convertValues(source["images"], Image);
	        this.uri = source["uri"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SimplePlaylist {
	    collaborative: boolean;
	    description: string;
	    external_urls: {[key: string]: string};
	    href: string;
	    id: string;
	    images: Image[];
	    name: string;
	    owner: User;
	    public: boolean;
	    snapshot_id: string;
	    tracks: PlaylistTracks;
	    uri: string;
	
	    static createFrom(source: any = {}) {
	        return new SimplePlaylist(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.collaborative = source["collaborative"];
	        this.description = source["description"];
	        this.external_urls = source["external_urls"];
	        this.href = source["href"];
	        this.id = source["id"];
	        this.images = this.convertValues(source["images"], Image);
	        this.name = source["name"];
	        this.owner = this.convertValues(source["owner"], User);
	        this.public = source["public"];
	        this.snapshot_id = source["snapshot_id"];
	        this.tracks = this.convertValues(source["tracks"], PlaylistTracks);
	        this.uri = source["uri"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class TrackExternalIDs {
	    isrc: string;
	    ean: string;
	    upc: string;
	
	    static createFrom(source: any = {}) {
	        return new TrackExternalIDs(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isrc = source["isrc"];
	        this.ean = source["ean"];
	        this.upc = source["upc"];
	    }
	}
	export class SimpleTrack {
	    album: SimpleAlbum;
	    artists: SimpleArtist[];
	    available_markets: string[];
	    disc_number: number;
	    duration_ms: number;
	    explicit: boolean;
	    external_urls: {[key: string]: string};
	    external_ids: TrackExternalIDs;
	    href: string;
	    id: string;
	    name: string;
	    preview_url: string;
	    track_number: number;
	    uri: string;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new SimpleTrack(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.album = this.convertValues(source["album"], SimpleAlbum);
	        this.artists = this.convertValues(source["artists"], SimpleArtist);
	        this.available_markets = source["available_markets"];
	        this.disc_number = source["disc_number"];
	        this.duration_ms = source["duration_ms"];
	        this.explicit = source["explicit"];
	        this.external_urls = source["external_urls"];
	        this.external_ids = this.convertValues(source["external_ids"], TrackExternalIDs);
	        this.href = source["href"];
	        this.id = source["id"];
	        this.name = source["name"];
	        this.preview_url = source["preview_url"];
	        this.track_number = source["track_number"];
	        this.uri = source["uri"];
	        this.type = source["type"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

