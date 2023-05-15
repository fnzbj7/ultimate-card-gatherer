

import { HttpClient } from "@angular/common/http";
import { Component, NgZone, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppService } from "../app.service";
import { SseService } from '../sse/sse.service';



export interface MessageData {
    status: string;
    message: string;
    a: number;
  }


@Component({
    selector: 'app-landing-screen',
    templateUrl: 'landing-screen.component.html',
    styleUrls: ['landing-screen.component.scss']
})
export class LandingScreenComponent implements OnInit {

    jsonArr!: {id: number, setCode: string, version: string}[];

    // fullMsg: string = 'START: ';

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private router: Router,
        private sseService: SseService) {}

    ngOnInit(): void {
        this.http.get<{id: number, setCode: string, version: string}[]>('/api/updated-urls').subscribe((x) => {
            this.jsonArr = x;
            console.log({x})
        });

        // this.sseService.createEventSource<MessageData>('/api/ssev2', (messageData) => {
        //     this.fullMsg += ' ' + messageData.a;
        // });

    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (!input.files?.length) {
            return;
        }

        const file = input.files[0];
        const formData = new FormData();
        formData.append("file", file);

        this.http.post<{ id: number, setCode: string, version: string }>("/api/entity/json-base/upload", formData).subscribe(resp => {
            console.log({resp})
            this.appService.setSetCode(resp.setCode);
            this.appService.id = resp.id;
            this.router.navigate(['hub', resp.id]);
        });
    }

    onGoToHub(event: MouseEvent, json: {id: number, setCode: string}) {
        event.preventDefault();
        this.appService.id = json.id;
        this.appService.setCode = json.setCode;
        this.router.navigate(['hub', json.id]);
    }

}
