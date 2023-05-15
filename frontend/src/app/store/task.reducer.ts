import { createReducer, on } from '@ngrx/store';
import { finishTask, finishTasks, setJsonBase, undoAllTask, undoTask } from './task.actions';
import { JsonBaseDto } from '../dto/dto-collection';

export interface AppState {
    tasks: TaskState;
}

export interface TaskState {
  finishedTaskIds: string[];
  jsonBase?: JsonBaseDto;
}

export const initialState: TaskState = {
  finishedTaskIds: [],
  jsonBase: undefined,
};

export const taskReducer = createReducer(
  initialState,
  on(setJsonBase, (state, {jsonBase}) => ({
    ...state,
    jsonBase,
  })),
  on(finishTask, (state, { taskId }) => ({
    ...state,
    finishedTaskIds: [...state.finishedTaskIds, taskId],
  })),
  on(finishTasks, (state, { taskIds }) => ({
    ...state,
    finishedTaskIds: [...state.finishedTaskIds, ...taskIds],
  })),
  on(undoTask, (state, { taskId }) => ({
    ...state,
    finishedTaskIds: state.finishedTaskIds.filter(id => id !== taskId),
  })),
  on(undoAllTask, (state) => ({
    ...state,
    finishedTaskIds: [],
  }))
);
