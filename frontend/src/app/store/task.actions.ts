import { createAction, props } from '@ngrx/store';
import { JsonBaseDto } from '../dto/dto-collection';

type IsFinishedJasonBase = keyof Pick<
  JsonBaseDto,
  'isCheckNumberF' | 'isDownloadImagesF' | 'isIconUploadF' | 'isJsonUploadF' | 'isUrlUploadF' | 'isMigrationGeneratedF' | 'isUploadAwsF' | 'isConvertImgF'
>;

export const setJsonBase = createAction('[Task] Set Json Base', props<{ jsonBase: JsonBaseDto }>());

export const finishTask = createAction('[Task] Finish Task', props<{ taskId: IsFinishedJasonBase }>());
