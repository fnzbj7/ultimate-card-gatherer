import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';

@Component({
  selector: 'app-aws-upload',
  templateUrl: 'aws-upload.component.html',
})
export class AwsUploadComponent implements OnInit {
  id!: string;
  isPrepare = false;
  setCode: string = '';


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

  onAwsUpload() {}
}
