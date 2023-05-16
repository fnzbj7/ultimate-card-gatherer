import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { finishTask } from '../store/task.actions';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';

@Component({
  selector: 'app-upload-component',
  templateUrl: 'icon-upload.component.html',
})
export class IconUploadComponent implements OnInit {
  selectedFile?: File;

  id = '';
  setCode = '';

  finishedTaskIds!: string[];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private taskService: TaskService,
  ) {}

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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('iconSvg', this.selectedFile);
      this.http.post(`/api/entity/json-base/${this.id}/upload-svg`, formData).subscribe(() => {
        this.store.dispatch(finishTask({ taskId: 'isIconUploadF' }));
        this.router.navigate(['hub', this.id]);
      });
    }
  }
}
