import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';
import { finishTask } from '../store/task.actions';

@Component({
  selector: 'app-aws-upload',
  templateUrl: 'aws-upload.component.html',
})
export class AwsUploadComponent implements OnInit {
  id!: string;
  isPrepare = false;
  confirm?: string;
  setCode: string = '';
  eventSource!: EventSource;
  maxProcess: number = 0;
  finishedProcess: number = 0;
  isStarted = false;


  constructor(private readonly route: ActivatedRoute,
    private store: Store<AppState>,
    private taskService: TaskService,) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.store.pipe(select((state) => state.tasks)).subscribe((tasks) => {
      if (tasks.jsonBase) {
        const { jsonBase } = tasks;
        this.setCode = jsonBase.setCode;
      }
    });
    if (!this.taskService.id && this.id) {
      this.taskService.setId(+this.id);
    }
  }

  onPrepareAws() {
    this.isPrepare = !this.isPrepare;
  }

  onAwsUpload() {
    if(this.confirm && this.confirm.toLocaleLowerCase() === 'webp') {
      this.isStarted = true;
      this.eventSource = new EventSource(`/api/entity/json-base/${this.id}/upload-aws`);
      this.eventSource.addEventListener('message', (event: { data: string }) => {
        const data = JSON.parse(event.data);
        this.maxProcess = data.maxProcess;
        this.finishedProcess = data.finishedProcess;
      });
      this.eventSource.onerror = (event: any) => {
        console.error('SSE error:', event);
        this.store.dispatch(finishTask({ taskId: 'isUploadAwsF' }));
        this.eventSource.close();
      };
    }

  }
}
