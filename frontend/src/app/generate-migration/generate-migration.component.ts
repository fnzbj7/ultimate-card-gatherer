import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../app.service';
import * as parserTypeScript from "prettier/parser-typescript";
import { format } from "prettier/standalone";


interface MigrationDto {
    text: string,
    fileName: string,
    cardService: string
}
@Component({
    selector: 'app-generate-migration',
    templateUrl: 'generate-migration.component.html'
})
export class GenerateMigrationComponent implements OnInit {

    id = '';
    setCode = '';

    code?: string;

    text?: string;
    fileName?: string
    
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

            this.http.get<MigrationDto>(`/api/${this.id}/generate-migration`).subscribe((x) => {
                if(x) {
                    this.code = x.cardService;
                    this.text = x.text
                    this.fileName = x.fileName;
                }

            })
        }

        downloadMigrationFile() {

            this.http.get<MigrationDto>(`/api/${this.id}/generate-migration?create=yes`).subscribe((x) => {
                this.code = x.cardService;

                this.text = x.text;
                this.fileName = x.fileName;

                if(this.text && this.fileName) {
                    this.generateDownload(this.text, this.fileName);
                }

            });
        }

        downloadCurrent() {
            if(this.text && this.fileName) {
                this.generateDownload(this.text, this.fileName);
            }
            
        }

        private generateDownload(text: string, fileName: string) {
            let fileContent = format(text, {
                parser: "typescript",
                plugins: [parserTypeScript],
            });
            const file = new Blob([fileContent], { type: "text/plain" });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(file);
            link.download = fileName;
            link.click();
            link.remove();
        }
}
