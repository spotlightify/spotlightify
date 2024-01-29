export interface FillAction {
  type: 'fill';
  payload: string;
  parentCommandId: string;
}

export interface PlayAction {
  type: 'anotherAction';
  payload: { SongName: string };
  parentCommandId: string;
}

export interface SetActiveCommandAction {
  type: 'setActiveCommand';
  parentCommandId: string;
}

export type Action = FillAction | PlayAction | SetActiveCommandAction;
