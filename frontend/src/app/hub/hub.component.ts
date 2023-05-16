import { Component, OnDestroy, OnInit } from '@angular/core';

import { ActivatedRoute, Route } from '@angular/router';

import { AppState } from '../store/task.reducer';
import { Store, select } from '@ngrx/store';
import { JsonBaseDto } from '../dto/dto-collection';
import { TaskService } from '../store/task.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hub',
  templateUrl: 'hub.component.html',
  styleUrls: ['hub.component.scss'],
})
export class HubComponent implements OnInit, OnDestroy {
  id: string = '';
  setCode: string = '';
  finishedTaskIds!: string[];

  jsonBase?: JsonBaseDto;
  isJsonUploadF: boolean = false;
  isIconUploadF: boolean = false;
  isMigrationGeneratedF: boolean = false;
  isUrlUploadF: boolean = false;
  isDownloadImagesF: boolean = false;
  isCheckNumberF: boolean = false;
  isConvertToWebpF: boolean = false;
  isUploadAwsF: boolean = false;

  store$!: Subscription;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private taskService: TaskService) {}

  ngOnInit(): void {
    this.store$ = this.store.pipe(select((state) => state.tasks)).subscribe((tasks) => {
      this.jsonBase = tasks.jsonBase;
      if (this.jsonBase) {
        this.isJsonUploadF = !!this.jsonBase.isJsonUploadF;
        this.isIconUploadF = !!this.jsonBase.isIconUploadF;
        this.isMigrationGeneratedF = !!this.jsonBase.isMigrationGeneratedF;
        this.isUrlUploadF = !!this.jsonBase.isUrlUploadF;
        this.isDownloadImagesF = !!this.jsonBase.isDownloadImagesF;
        this.isCheckNumberF = !!this.jsonBase.isCheckNumberF;
        this.isConvertToWebpF = !!this.jsonBase.isConvertToWebpF;
        this.isUploadAwsF = !!this.jsonBase.isUploadAwsF;
        this.setCode = this.jsonBase.setCode;
      }
    });
    this.id = this.route.snapshot.params['id'];

    if (!this.taskService.id && this.id) {
      this.taskService.setId(+this.id);
    }
  }

  ngOnDestroy(): void {
    if (this.store$) {
      this.store$.unsubscribe();
    }
  }
}
