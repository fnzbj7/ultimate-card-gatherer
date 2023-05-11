import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../app.service';

@Component({
    selector: 'app-generate-migration',
    templateUrl: 'generate-migration.component.html'
})
export class GenerateMigrationComponent implements OnInit {

    id = '';
    setCode = '';
    
    constructor(private http: HttpClient,
        private route: ActivatedRoute,
        private appService: AppService) {}

        ngOnInit(): void {
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
}
