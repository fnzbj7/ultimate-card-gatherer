import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-aws-upload',
    templateUrl: 'aws-upload.component.html'
})
export class AwsUploadComponent implements OnInit {

    id!: string;
    isPrepare = false;


    constructor(
        private readonly route: ActivatedRoute,
        private readonly http: HttpClient
    ){}
    
    ngOnInit(): void {
        this.id = this.route.snapshot.params["id"];
    }

    onPrepareAws() {
        this.isPrepare = !this.isPrepare;
    }

    onAwsUpload() {

    }
}
