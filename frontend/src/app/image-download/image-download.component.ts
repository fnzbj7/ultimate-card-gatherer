import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finishTask } from '../store/task.actions';
import { Store, select } from '@ngrx/store';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';

@Component({
  selector: 'app-image-download',
  templateUrl: 'image-download.component.html',
})
export class ImageDownloadComponent implements OnInit, OnDestroy {
  maxProcess: number = 0;
  finishedProcess: number = 0;

  eventSource!: EventSource;
  id!: string;
  setCode = '';

  isStarted = false;
  isDownloadImagesF = false;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private taskService: TaskService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.store.pipe(select((state) => state.tasks)).subscribe((tasks) => {
      if (tasks.jsonBase) {
        const { jsonBase } = tasks;
        this.setCode = jsonBase.setCode;
        this.isDownloadImagesF = jsonBase.isDownloadImagesF;

      }
    });
    if (!this.taskService.id && this.id) {
      this.taskService.setId(+this.id);
    }
  }

  onStartDownload() {
    this.isStarted = true;
    this.eventSource = new EventSource(`/api/image-download?id=${this.id}`);
    this.eventSource.addEventListener('message', (event: { data: string }) => {
      const data = JSON.parse(event.data);
      this.maxProcess = data.maxProcess;
      this.finishedProcess = data.finishedProcess;
    });
    this.eventSource.onerror = (event: any) => {
      console.error('SSE error:', event);
      this.isStarted = false;
      this.store.dispatch(finishTask({ taskId: 'isDownloadImagesF' }));
      this.eventSource.close();
    };
  }

  onDelete() {
    // Visszacsinálni mindent
    // Mentett képektől kezdve mindent
  }

  ngOnDestroy(): void {
    if (this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) {
      this.eventSource.close();
    }
  }
}
