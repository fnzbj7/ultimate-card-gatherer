import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';

@Component({
    selector: 'app-upload-json',
    templateUrl: 'upload-json.component.html'
})
export class UploadJsonComponent implements OnInit {

    selectedFile?: File;
    id?: string;
    setCode?: string;

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private store: Store<AppState>,
        private taskService: TaskService) {}
    
    
    ngOnInit(): void {
      this.id = this.route.snapshot.params['id'];

      this.store.pipe(select(state => state.tasks)).subscribe(tasks => {
        if(tasks.jsonBase) {
          const { jsonBase } = tasks;
            this.setCode = jsonBase.setCode
        }
      });
      if(!this.taskService.id && this.id) {
        this.taskService.setId(+this.id);
      }
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
        if(this.selectedFile) {
          const id = this.route.snapshot.params['id'];
          const formData = new FormData();
          formData.append('json', this.selectedFile);
          this.http.post(`/api/entity/json-base/${id}/update-json`, formData).subscribe();
        }
      }

}
