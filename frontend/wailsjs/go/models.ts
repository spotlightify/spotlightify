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

