import { Component, OnInit } from "@angular/core";
import { AppService } from "../app.service";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: 'app-url-upload',
    templateUrl: 'url-upload.component.html'
})
export class UrlUploadComponent implements OnInit {

    setCode?: string

    url: string = "";
    urlList: string[] = [];

    isLoading = false;

    constructor(
        private appService: AppService,
        private router: Router,
        private http: HttpClient) {}

    ngOnInit(): void {
        this.setCode = this.appService.getSetCode();
    }

    onAddingUrl() {
        this.urlList.push(this.url);
        this.url = "";
    }

    onSendToBackend() {
        this.isLoading = true;
        this.http.post("/api/upload-url-list", {id: this.appService.id, urlList: this.urlList}).subscribe(() => {
            this.isLoading = false;

        });

    }

    onDeleteUrl(url: string) {
        this.urlList = this.urlList.filter(x => x !== url);
    }

}
