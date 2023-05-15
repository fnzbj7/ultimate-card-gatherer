import { createAction, props } from '@ngrx/store';
import { JsonBaseDto } from '../dto/dto-collection';

type MyType = keyof Pick<
  JsonBaseDto,
  'isCheckNumberF' | 'isDownloadImagesF' | 'isIconUploadF' | 'isJsonUploadF' | 'isUrlUploadF'
>;

export const setJsonBase = createAction('[Task] Set Json Base', props<{ jsonBase: JsonBaseDto }>());

export const finishTask = createAction('[Task] Finish Task', props<{ taskId: MyType }>());
