import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-image-download',
  templateUrl: 'image-download.component.html',
})
export class ImageDownloadComponent implements OnDestroy {

    maxProcess: number = 0;
    finishedProcess: number = 0;

    eventSource!: EventSource;
  
    constructor(private route: ActivatedRoute) {}


  onStartDownload() {
    const id = this.route.snapshot.params['id'];
    this.eventSource = new EventSource(`/api/image-download?id=${id}`);
    this.eventSource.addEventListener('message', (event: { data: string }) => {
      const data = JSON.parse(event.data);
      this.maxProcess = data.maxProcess;
      this.finishedProcess = data.finishedProcess;

    });
    this.eventSource.onerror = (event: any) => {
      console.error('SSE error:', event);
      this.eventSource.close();
      // TODO: handle error
    };
  }

  ngOnDestroy(): void {
    if (this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) {
      this.eventSource.close();
    }
  }
}
