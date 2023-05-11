import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-upload-json',
    templateUrl: 'upload-json.component.html'
})
export class UploadJsonComponent implements OnInit {

    selectedFile?: File;
    id!: string;
    setCode?: string;

    constructor(
        private appService: AppService,
        private route: ActivatedRoute,
        private http: HttpClient) {}
    
    
    ngOnInit(): void {
      this.id = this.route.snapshot.params['id'];
      if(this.appService.setCode) {
          this.setCode = this.appService.setCode;
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
