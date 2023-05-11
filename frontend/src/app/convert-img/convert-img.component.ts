import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-convert-img',
    templateUrl: 'convert-img.component.html'
})
export class ConvertImgComponent implements OnInit {

    id!: string;
    quality = '65-80';

    constructor(
        private readonly route: ActivatedRoute,
        private readonly http: HttpClient
    ){}
    
    ngOnInit(): void {
        this.id = this.route.snapshot.params["id"];
    }

    
  onResize() {

    const {id, quality} = this;
    this.http.post<string[]>("api/resize", {id, quality})
      .subscribe((errArr) => {
        console.log('végzett RESIZE');
      });
  }

  onConvertToWebp() {
    const {id} = this;
    this.http.post<void>("api/webp", {id}).subscribe(() => {
      console.log('végzett webp');
    });
  }

}
