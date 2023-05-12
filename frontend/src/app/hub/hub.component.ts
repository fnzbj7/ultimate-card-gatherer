import { Component, OnInit } from "@angular/core";
import { AppService } from "../app.service";
import { ActivatedRoute, Route } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { AppState } from "../store/task.reducer";
import { Store, select } from "@ngrx/store";

@Component({
    selector: 'app-hub',
    templateUrl: 'hub.component.html',
    styleUrls: ['hub.component.scss']
})
export class HubComponent implements OnInit {

    id: string = "";
    setCode: string = '';
    finishedTaskIds!: string[];

    isIconUploadFinished = false;

    constructor(
        private appService: AppService,
        private route: ActivatedRoute,
        private http: HttpClient,
        private store: Store<AppState>) {}

    ngOnInit(): void {
        this.store.pipe(select(state => {
            console.log({state});
            return state.tasks;
          })).subscribe(tasks => {
            this.finishedTaskIds = tasks.finishedTaskIds;
            this.isIconUploadFinished = this.finishedTaskIds.includes('IconUpload');
          });
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
