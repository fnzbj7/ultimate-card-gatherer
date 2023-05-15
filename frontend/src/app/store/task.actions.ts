import { createAction, props } from '@ngrx/store';
import { JsonBaseDto } from '../dto/dto-collection';

export const setJsonBase = createAction(
  '[Task] Set Json Base',
  props<{ jsonBase: JsonBaseDto }>()
);

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
