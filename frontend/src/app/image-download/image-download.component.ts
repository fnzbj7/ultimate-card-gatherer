import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../app.service';
import { finishTask } from '../store/task.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../store/task.reducer';

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

  constructor(private appService: AppService, private route: ActivatedRoute, private store: Store<AppState>) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    if (this.appService.setCode) {
      this.setCode = this.appService.setCode;
    }
  }

  onStartDownload() {
    this.eventSource = new EventSource(`/api/image-download?id=${this.id}`);
    this.eventSource.addEventListener('message', (event: { data: string }) => {
      const data = JSON.parse(event.data);
      this.maxProcess = data.maxProcess;
      this.finishedProcess = data.finishedProcess;
    });
    this.eventSource.onerror = (event: any) => {
      console.error('SSE error:', event);
      this.store.dispatch(finishTask({ taskId: 'isDownloadImagesF' }));
      this.eventSource.close();
    };
  }

  ngOnDestroy(): void {
    if (this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) {
      this.eventSource.close();
    }
  }
}
