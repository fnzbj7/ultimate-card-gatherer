import { createReducer, on } from '@ngrx/store';
import { finishTask, revertTask, setJsonBase } from './task.actions';
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
  on(finishTask, (state, { taskId, urls }) => {
    if (state.jsonBase) {
      const jsonBase: JsonBaseDto = { ...state.jsonBase };
      jsonBase[taskId] = true;
      if(urls) {
        jsonBase.urls = urls;
      }
      console.log({ jsonBase });
      return { ...state, jsonBase };
    }
    return { ...state };
  }),
  on(revertTask, (state, { taskIds }) => {
    if (state.jsonBase) {
      const jsonBase: JsonBaseDto = { ...state.jsonBase };
      taskIds.forEach(taskId => (jsonBase[taskId] = false));
      return { ...state, jsonBase }; // TODO ilyen url és társait is lehet nullázni kéne, de még BE oldalon is
    }
    return {...state};
  })
);
