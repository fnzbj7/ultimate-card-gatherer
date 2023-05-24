import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';
import { finishTask } from '../store/task.actions';

@Component({
  selector: 'app-convert-img',
  templateUrl: 'convert-img.component.html',
})
export class ConvertImgComponent implements OnInit {
  id!: string;
  quality = '65-80';
  setCode?: string;
  isRenameImgF = false;
  renameError = false;
  isRenameLoading = false;
  errorCount = 0;
  isWebpLoading = false;
  isConvertToWebpF = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
    private store: Store<AppState>,
    private taskService: TaskService,) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.store.pipe(select((state) => state.tasks)).subscribe((tasks) => {
      if (tasks.jsonBase) {
        const { jsonBase } = tasks;
        this.setCode = jsonBase.setCode;
        this.isRenameImgF = jsonBase.isRenameImgF;
        this.isConvertToWebpF = jsonBase.isConvertToWebpF;
      }
    });
    if (!this.taskService.id && this.id) {
      this.taskService.setId(+this.id);
    }
  }

  onResize() {
    const { id, quality } = this;
    this.renameError = false;
    this.isRenameLoading = true;
    this.http.post<string[]>('api/resize', { id, quality }).subscribe((errArr) => {
      this.isRenameLoading = false;
      if(errArr && errArr.length > 0){
        this.renameError = true;
        console.log({errArr})
        this.errorCount = errArr.length;
      } else {
        this.store.dispatch(finishTask({ taskId: 'isRenameImgF' }));
      }     
    });
  }

  onConvertToWebp() {
    this.isWebpLoading = true;
    const { id } = this;
    this.http.post<void>('api/webp', { id }).subscribe(() => {
      this.isWebpLoading = false;
      this.isConvertToWebpF = true;
      this.store.dispatch(finishTask({ taskId: 'isConvertToWebpF' }));
    });
  }
}
