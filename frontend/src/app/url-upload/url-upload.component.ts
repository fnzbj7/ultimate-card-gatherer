import { Component, OnInit } from "@angular/core";
import { AppService } from "../app.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: 'app-url-upload',
    templateUrl: 'url-upload.component.html',
    styleUrls: ['url-upload.component.scss']
})
export class UrlUploadComponent implements OnInit {

    setCode?: string

    url: string = "";
    urlList: string[] = [];

    searchTerm = '';

    isLoading = false;
    id!: string;

    constructor(
        private appService: AppService,
        private route: ActivatedRoute,
        private http: HttpClient) {}

    ngOnInit(): void {
        this.setCode = this.appService.getSetCode();
        this.id = this.route.snapshot.params['id'];
        this.http.get<{fullName: string}>(`/api/entity/json-base/${this.id}/full-name`).subscribe(resp => {
            if(resp) {
                this.searchTerm = resp.fullName.replaceAll(' ', '+')
            }
        });

        this.http.get<{urls: string}>(`/api/entity/json-base/${this.id}/full`).subscribe(resp => {
            if(resp && resp.urls) {
                this.urlList = resp.urls.split(',')
            }
        })
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
