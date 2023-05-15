import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { TaskService } from '../store/task.service';
import { AppState } from '../store/task.reducer';
import { finishTask } from '../store/task.actions';

@Component({
  selector: 'app-url-upload',
  templateUrl: 'url-upload.component.html',
  styleUrls: ['url-upload.component.scss'],
})
export class UrlUploadComponent implements OnInit {
  setCode?: string;

  url: string = '';
  urlList: string[] = [];

  searchTerm = '';

  isLoading = false;
  id!: string;

  constructor(
    private route: ActivatedRoute,
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
    this.isLoading = true;
    this.http.post('/api/upload-url-list', { id: this.id, urlList: this.urlList }).subscribe(() => {
      this.store.dispatch(finishTask({ taskId: 'isUrlUploadF' }));
      this.isLoading = false;
    });
  }

  onDeleteUrl(url: string) {
    this.urlList = this.urlList.filter((x) => x !== url);
  }
}
