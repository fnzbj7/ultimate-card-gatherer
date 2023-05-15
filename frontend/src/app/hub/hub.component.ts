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

  store$!: Subscription;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private taskService: TaskService) {}

  ngOnInit(): void {
    this.store$ = this.store.pipe(select((state) => state.tasks)).subscribe((tasks) => {
      this.jsonBase = tasks.jsonBase;
      console.log('A hubnál', { jb: tasks.jsonBase });
      if (this.jsonBase) {
        this.isJsonUploadF = this.jsonBase.isJsonUploadF ? true : false;
        this.isIconUploadF = this.jsonBase.isIconUploadF ? true : false;
        this.isMigrationGeneratedF = this.jsonBase.isMigrationGeneratedF ? true : false;
        this.isUrlUploadF = this.jsonBase.isUrlUploadF ? true : false;
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
