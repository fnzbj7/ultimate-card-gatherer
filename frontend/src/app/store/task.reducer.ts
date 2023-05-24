import { createReducer, on } from '@ngrx/store';
import { finishTask, setJsonBase } from './task.actions';
import { JsonBaseDto } from '../dto/dto-collection';

export interface AppState {
  tasks: TaskState;
}

export interface TaskState {
  jsonBase?: JsonBaseDto;
}

export const initialState: TaskState = {
  jsonBase: undefined,
};

export const taskReducer = createReducer(
  initialState,
  on(setJsonBase, (state, { jsonBase }) => ({
    ...state,
    jsonBase,
  })),
  on(finishTask, (state, { taskId }) => {
    if (state.jsonBase) {
      const jsonBase: JsonBaseDto = { ...state.jsonBase };
      console.log('itt járt');
      jsonBase[taskId] = true;
      console.log({ jsonBase });
      return { ...state, jsonBase };
    }
    return { ...state };
  }),
);
