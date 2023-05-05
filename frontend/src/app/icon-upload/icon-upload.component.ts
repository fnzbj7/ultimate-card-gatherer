import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-upload-component',
  templateUrl: 'icon-upload.component.html'
})
export class IconUploadComponent {
  selectedFile?: File;

  constructor(private http: HttpClient,
    private route: ActivatedRoute) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if(this.selectedFile) {
        const id = this.route.snapshot.params['id'];
        const formData = new FormData();
        formData.append('iconSvg', this.selectedFile);
        this.http.post(`/api/entity/json-base/${id}/upload-svg`, formData).subscribe();
    }
    
  }
}
