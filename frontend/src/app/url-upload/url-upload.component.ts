import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { finishTask } from '../store/task.actions';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';

@Component({
  selector: 'app-url-upload',
  templateUrl: 'url-upload.component.html',
  styleUrls: ['url-upload.component.scss'],
})
export class UrlUploadComponent implements OnInit {
  setCode?: string;
  cardGaleryName?: string;

  url: string = '';
  urlList: string[] = [];

  searchTerm = '';

  id!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private store: Store<AppState>,
    private taskService: TaskService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.store.pipe(select((state) => state.tasks)).subscribe((tasks) => {
      if (tasks.jsonBase) {
        const { jsonBase } = tasks;
        this.setCode = jsonBase.setCode;
        this.cardGaleryName = jsonBase.name.toLowerCase().replaceAll(' ', '-').replaceAll(':', '');
        this.searchTerm = jsonBase.name.replaceAll(' ', '+');
        if (jsonBase.urls) {
          this.urlList = jsonBase.urls.split(',');
        }
      }
    });
    if (!this.taskService.id && this.id) {
      this.taskService.setId(+this.id);
    }
  }

  onAddingUrl() {
    this.urlList.push(this.url);
    this.url = '';
  }

  onSendToBackend() {
    this.http.post('/api/upload-url-list', { id: this.id, urlList: this.urlList }).subscribe(() => {
      this.store.dispatch(finishTask({ taskId: 'isUrlUploadF', urls: this.urlList.join(',') }));
      this.router.navigate(['hub', this.id]);
    });
  }

  onDeleteUrl(url: string) {
    this.urlList = this.urlList.filter((x) => x !== url);
  }

  onClearAll() {
    if (confirm('Are you sure you want to clear all URLs?')) {
      this.urlList = [];
    }
  }

  onCopyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      // Could add a toast notification here if you have one
      console.log('URL copied to clipboard');
    });
  }

  getUrlBase(url: string): string {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const pathParts = urlObj.pathname.split('/').filter((p) => p);

      if (pathParts.length === 0) {
        return domain;
      }

      const lastPart = pathParts[pathParts.length - 1];

      if (pathParts.length === 1) {
        return `${domain}/${lastPart}`;
      }

      return `${domain}/.../${lastPart}`;
    } catch {
      // If URL parsing fails, truncate the string manually
      if (url.length > 60) {
        return url.substring(0, 30) + '...' + url.substring(url.length - 27);
      }
      return url;
    }
  }

  getUrlParams(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.search + urlObj.hash;
    } catch {
      // If parsing fails, try to extract params manually
      const match = url.match(/[?#].+$/);
      return match ? match[0] : '';
    }
  }
}
