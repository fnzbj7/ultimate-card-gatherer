

import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as parserTypeScript from "prettier/parser-typescript";
import * as prettier from "prettier/standalone";
import { AppService } from "../app.service";

interface UploadAndProcess {
    text: string,
    fileName: string,
    cardService: string
}


@Component({
    selector: 'app-landing-screen',
    templateUrl: 'landing-screen.component.html'
})
export class LandingScreenComponent {

    constructor(
        private http: HttpClient,
        private appService: AppService,
        private router: Router) {}

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (!input.files?.length) {
            return;
        }

        const file = input.files[0];
        const formData = new FormData();
        formData.append("file", file);

        const upload$ = this.http.post<{ id: number, setCode: string, version: string }>("/api/upload", formData).subscribe(resp => {
            console.log({resp})
            this.appService.setSetCode(resp.setCode);
            this.appService.id = resp.id;
            this.router.navigate(['url-upload']);
            // TODO navigate 
        });
    }

    downloadMigrationFile(formData: FormData) {

        const upload$ = this.http.post<UploadAndProcess>("/api/upload-and-process", formData).subscribe((x) => {

            let fileContent = prettier.format(x.text, {
                parser: "typescript",
                plugins: [parserTypeScript],
            });
            const file = new Blob([fileContent], { type: "text/plain" });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(file);
            link.download = x.fileName;
            link.click();
            link.remove();
        });
    }

}


