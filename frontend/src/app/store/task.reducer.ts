import { createReducer, on } from '@ngrx/store';
import { finishTask, finishTasks, undoAllTask, undoTask } from './task.actions';

export interface AppState {
    tasks: TaskState;
}

export interface TaskState {
  finishedTaskIds: string[];
}

export const initialState: TaskState = {
  finishedTaskIds: [],
};

export const taskReducer = createReducer(
  initialState,
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
