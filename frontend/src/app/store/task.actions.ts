import { createAction, props } from '@ngrx/store';

export const finishTask = createAction(
  '[Task] Finish Task',
  props<{ taskId: string }>()
);

export const finishTasks = createAction(
    '[Task] Finish Tasks',
    props<{ taskIds: string[] }>()
  );

export const undoTask = createAction(
  '[Task] Undo Task',
  props<{ taskId: string }>()
);

export const undoAllTask = createAction(
    '[Task] Undo All Task'
  );
