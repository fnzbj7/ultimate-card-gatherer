import { Component, OnInit } from "@angular/core";
import { AppService } from "../app.service";
import { ActivatedRoute, Route } from "@angular/router";

@Component({
    selector: 'app-hub',
    templateUrl: 'hub.component.html'
})
export class HubComponent implements OnInit {

    id: string = "";

    constructor(
        private appService: AppService,
        private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.id = this.route.snapshot.params["id"];
    }

}
