// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import {Call as $Call, Create as $Create} from "@wailsio/runtime";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import * as spotify$0 from "../../github.com/zmb3/spotify/v2/models.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import * as model$0 from "./internal/model/models.js";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import * as $models from "./models.js";

export function AddClientID(clientID: string): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(3800419158, clientID) as any;
    return $resultPromise;
}

export function AddClientSecret(clientSecret: string): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1340611899, clientSecret) as any;
    return $resultPromise;
}

export function AuthenticateWithSpotify(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(3677210190) as any;
    return $resultPromise;
}

export function ChangeRepeatState(repeatState: string): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2256930927, repeatState) as any;
    return $resultPromise;
}

export function ChangeShuffle(shuffleOn: boolean): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(4284328126, shuffleOn) as any;
    return $resultPromise;
}

export function CheckIfAuthenticatedWithSpotify(): Promise<boolean> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2307428207) as any;
    return $resultPromise;
}

export function CloseAuthServer(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(813674914) as any;
    return $resultPromise;
}

/**
 * domReady is called after front-end resources have been loaded
 */
export function DomReady(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1786434506) as any;
    return $resultPromise;
}

export function ExecuteCommand(commandId: string, parameters: { [_: string]: string }): Promise<model$0.ExecuteActionOutput> & { cancel(): void } {
    let $resultPromise = $Call.ByID(3523822489, commandId, parameters) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType0($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function GetActiveDevice(): Promise<spotify$0.PlayerDevice> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2223992591) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType1($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function GetAlbumsByQuery(query: string): Promise<spotify$0.SimpleAlbum[]> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1594357110, query) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType3($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function GetArtistsByQuery(query: string): Promise<spotify$0.FullArtist[]> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2843076772, query) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType5($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function GetClientID(): Promise<string> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1833178989) as any;
    return $resultPromise;
}

export function GetClientSecret(): Promise<string> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2662411452) as any;
    return $resultPromise;
}

export function GetCurrentlyPlayingTrack(): Promise<$models.CurrentlyPlayingTrack | null> & { cancel(): void } {
    let $resultPromise = $Call.ByID(224975610) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType7($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function GetDevices(): Promise<spotify$0.PlayerDevice[]> & { cancel(): void } {
    let $resultPromise = $Call.ByID(763227954) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType8($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function GetEpisodesByShowID(showID: string): Promise<spotify$0.EpisodePage[]> & { cancel(): void } {
    let $resultPromise = $Call.ByID(77304916, showID) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType10($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function GetPlaylistsByQuery(query: string): Promise<spotify$0.SimplePlaylist[]> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1987648749, query) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType12($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function GetRepeatState(): Promise<string> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1339835261) as any;
    return $resultPromise;
}

export function GetShowsByQuery(query: string): Promise<spotify$0.FullShow[]> & { cancel(): void } {
    let $resultPromise = $Call.ByID(4114947090, query) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType14($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function GetSuggestions(input: string, commandId: string, parameters: { [_: string]: string }): Promise<model$0.SuggestionList> & { cancel(): void } {
    let $resultPromise = $Call.ByID(756502564, input, commandId, parameters) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType15($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function GetTracksByQuery(query: string): Promise<spotify$0.SimpleTrack[]> & { cancel(): void } {
    let $resultPromise = $Call.ByID(613952222, query) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType17($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function GetVolume(): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2722380857) as any;
    return $resultPromise;
}

export function IsCurrentSongLiked(): Promise<boolean> & { cancel(): void } {
    let $resultPromise = $Call.ByID(3094962052) as any;
    return $resultPromise;
}

export function IsShuffled(): Promise<boolean> & { cancel(): void } {
    let $resultPromise = $Call.ByID(4020004694) as any;
    return $resultPromise;
}

export function LikeCurrentSong(like: boolean): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1026971542, like) as any;
    return $resultPromise;
}

export function Next(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2406553696) as any;
    return $resultPromise;
}

export function Pause(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2047487349) as any;
    return $resultPromise;
}

export function PlayAlbum(uri: string): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(3608739490, uri) as any;
    return $resultPromise;
}

export function PlayAnythingToDevice(playOptions: spotify$0.PlayOptions | null): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1917496178, playOptions) as any;
    return $resultPromise;
}

export function PlayArtistsTopTracks(artistID: string): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(4284503232, artistID) as any;
    return $resultPromise;
}

export function PlayLiked(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2697651060) as any;
    return $resultPromise;
}

export function PlayPlaylist(uri: string): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(121314525, uri) as any;
    return $resultPromise;
}

export function PlayPodcast(uri: string): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(3277550313, uri) as any;
    return $resultPromise;
}

export function PlayTrack(URI: string): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(3729896154, URI) as any;
    return $resultPromise;
}

export function Previous(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1907008864) as any;
    return $resultPromise;
}

export function QueueTrack(trackID: string): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1952217479, trackID) as any;
    return $resultPromise;
}

export function Resume(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(540699954) as any;
    return $resultPromise;
}

export function Seek(positionMS: number): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2184148505, positionMS) as any;
    return $resultPromise;
}

export function SetActiveDevice(deviceID: string): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(3632025171, deviceID) as any;
    return $resultPromise;
}

export function SetAuthenticatedWithSpotify(authenticated: boolean): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1542059400, authenticated) as any;
    return $resultPromise;
}

export function SetVolume(volume: number): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1967324021, volume) as any;
    return $resultPromise;
}

/**
 * Expose the ShowWindow function to the frontend
 */
export function ShowWindow(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1164627400) as any;
    return $resultPromise;
}

export function Shuffle(shuffle: boolean): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1789514038, shuffle) as any;
    return $resultPromise;
}

export function Startup(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByID(560924242) as any;
    return $resultPromise;
}

// Private type creation functions
const $$createType0 = model$0.ExecuteActionOutput.createFrom;
const $$createType1 = spotify$0.PlayerDevice.createFrom;
const $$createType2 = spotify$0.SimpleAlbum.createFrom;
const $$createType3 = $Create.Array($$createType2);
const $$createType4 = spotify$0.FullArtist.createFrom;
const $$createType5 = $Create.Array($$createType4);
const $$createType6 = $models.CurrentlyPlayingTrack.createFrom;
const $$createType7 = $Create.Nullable($$createType6);
const $$createType8 = $Create.Array($$createType1);
const $$createType9 = spotify$0.EpisodePage.createFrom;
const $$createType10 = $Create.Array($$createType9);
const $$createType11 = spotify$0.SimplePlaylist.createFrom;
const $$createType12 = $Create.Array($$createType11);
const $$createType13 = spotify$0.FullShow.createFrom;
const $$createType14 = $Create.Array($$createType13);
const $$createType15 = model$0.SuggestionList.createFrom;
const $$createType16 = spotify$0.SimpleTrack.createFrom;
const $$createType17 = $Create.Array($$createType16);
