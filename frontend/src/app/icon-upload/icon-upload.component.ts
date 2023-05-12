import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../app.service';
import { JsonBaseDto } from '../dto/dto-collection';
import { Store, select } from '@ngrx/store';
import { finishTask } from '../store/task.actions';
import { AppState, TaskState } from '../store/task.reducer';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-upload-component',
  templateUrl: 'icon-upload.component.html'
})
export class IconUploadComponent implements OnInit {
  selectedFile?: File;

  id = '';
  setCode = '';

  finishedTaskIds!: string[];

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private appService: AppService,
    private store: Store<AppState>
  ) {}
  
  ngOnInit(): void {
    this.store.pipe(select(state => {
      console.log({state});
      return state.tasks;
    })).subscribe(tasks => {
      this.finishedTaskIds = tasks.finishedTaskIds;
    });


    this.id = this.route.snapshot.params["id"];
    if(this.appService.setCode) {
        this.setCode = this.appService.setCode;
    } else {
      this.appService.getSingleJsonBase(this.id).subscribe(({setCode}) => {
            this.setCode = setCode;
            this.appService.setCode = setCode;
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if(this.selectedFile) {
      const id = this.route.snapshot.params['id'];
      const formData = new FormData();
      formData.append('iconSvg', this.selectedFile);
      this.http.post(`/api/entity/json-base/${id}/upload-svg`, formData).subscribe(() => {
        this.store.dispatch(finishTask({ taskId: 'IconUpload' }));
      });
    }
  }

}
