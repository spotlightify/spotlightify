export interface FillAction {
  type: 'fill';
  payload: string;
  parentCommandId: string;
}

export interface ExecuteAction {
  type: 'execute';
  payload: () => void;
  parentCommandId: string;
}

export interface SetActiveCommandAction {
  type: 'setActiveCommand';
  parentCommandId: string;
}

export type Action = FillAction | ExecuteAction | SetActiveCommandAction;
