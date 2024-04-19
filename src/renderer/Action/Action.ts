export interface Action {
  executeOnEnter?: () => Promise<void>;
  activeCommandId?: string;
  clearActiveCommand?: boolean;
  closePrompt?: boolean;
  setPromptText?: string;
  preservePromptText?: boolean;
}

export function createExecuteAction(
  payload: () => Promise<void>,
  overrides?: Action,
): Action {
  return {
    executeOnEnter: payload,
    clearActiveCommand: true,
    closePrompt: true,
    ...overrides,
  };
}

export function createSetActiveCommandAction(
  commandId: string,
  overrides?: Action,
): Action {
  return {
    activeCommandId: commandId,
    ...overrides,
  };
}

/**
 * Represents an action that fills a payload with a string value.
 */
export interface FillAction {
  type: 'fill';
  payload: string;
}

/**
 * Represents an action that executes a payload function.
 *
 * * @throws {Error} If there's an error during the execution of the payload function,
 * * @throws {ExecuteError} This error can be thrown to display an error message to the user.
 *  If an error occurs during the execution of the payload function, an error message should be displayed to the user.
 *  It is best to use this error type to display an error message to the user instead of throwing a regular error.
 */
export interface ExecuteAction {
  type: 'execute';
  payload: () => Promise<void>;
}

/**
 * Represents an action that sets the active command.
 */
export interface SetActiveCommandAction {
  type: 'setActiveCommand';
  commandId: string;
  settings?: Action;
}

/**
 * Represents a null action.
 */
export interface NullAction {
  type: 'nullAction';
}

/**
 * Represents a union type of all possible actions.
 */
export type aAction =
  | FillAction
  | ExecuteAction
  | SetActiveCommandAction
  | NullAction;

/**
 * Represents an error that occurred when an execute command has run.
 * This is used to display an error message to the user when an error occurs.
 */
export interface ExecuteError {
  errorTitle: string;
  errorDescription: string;
  clearPrompt?: boolean;
  clearActiveCommand?: boolean;
  icon: string;
  /** The action to run when the error suggestion is clicked */
  action: aAction;
}
