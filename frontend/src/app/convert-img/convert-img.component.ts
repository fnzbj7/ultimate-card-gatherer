import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';

@Component({
  selector: 'app-convert-img',
  templateUrl: 'convert-img.component.html',
})
export class ConvertImgComponent implements OnInit {
  id!: string;
  quality = '65-80';
  setCode?: string;
  isDonePng = false;

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
      }
    });
    if (!this.taskService.id && this.id) {
      this.taskService.setId(+this.id);
    }
  }

  onResize() {
    const { id, quality } = this;
    this.http.post<string[]>('api/resize', { id, quality }).subscribe((errArr) => {
      console.log('végzett RESIZE');
      // TODO megnézni azt az array-t
      this.isDonePng = true;
    });
  }

  onConvertToWebp() {
    const { id } = this;
    this.http.post<void>('api/webp', { id }).subscribe(() => {
      console.log('végzett webp');
    });
  }
}
