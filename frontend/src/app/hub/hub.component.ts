import { Component, OnInit } from "@angular/core";
import { AppService } from "../app.service";
import { ActivatedRoute, Route } from "@angular/router";
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-hub',
    templateUrl: 'hub.component.html',
    styleUrls: ['hub.component.scss']
})
export class HubComponent implements OnInit {

    id: string = "";
    setCode: string = '';

    constructor(
        private appService: AppService,
        private route: ActivatedRoute,
        private http: HttpClient,) {}

    ngOnInit(): void {
        this.id = this.route.snapshot.params["id"];
        if(this.appService.setCode) {
            this.setCode = this.appService.setCode;
        } else {
            this.http.get<{setCode: string}>('/api/entity/json-base/1/full').subscribe(({setCode}) => {
                this.setCode = setCode;
                this.appService.setCode = setCode;
            })
        }
        
    }

}
