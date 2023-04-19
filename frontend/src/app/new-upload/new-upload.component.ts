import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import parserTypeScript from "prettier/parser-typescript";
import prettier from "prettier/standalone";


@Component({
    selector: 'app-new-upload',
    templateUrl: './new-upload.component.html'
})
export class NewUploadComponent implements OnInit {

    jsonBases: [];

    step = 1

    url: string;
    urlList: string[] = [];
    cardService: string = '';

    constructor(private http: HttpClient) {}
    
    ngOnInit(): void {
        this.http.get("http://localhost:3000/json-base").subscribe((x: []) => {
            console.log(x); 
            this.jsonBases = x;
        })
    }

    onFileSelected(event) {
        const file:File = event.target.files[0];

        if (file) {

            const formData = new FormData();
            formData.append("file", file);
            // const upload$ = this.http.post("http://localhost:3000/upload", formData);

            // upload$.subscribe((x: []) => {
            //     this.jsonBases = x;
            //     this.step = 2;
            // });
            const upload$ = this.http.post("http://localhost:3000/upload-and-process", formData).subscribe((x: {text: string, fileName: string, cardService: string}) => {
                this.cardService = x.cardService;
            // let fileName = 'random' + '.' + 'js';

                // let fileContent = prettier.format(x.text, { // "foo ( );"
                //     parser: "typescript",
                //     plugins: [parserTypeScript],
                // });
                // const file = new Blob([fileContent], { type: "text/plain" });
    
                // const link = document.createElement("a");
                // link.href = URL.createObjectURL(file);
                // link.download = x.fileName;
                // link.click();
                // link.remove();
            });

            
        }
    }

    onDownloadStart() {

    }

    onAddingUrl() {
        this.urlList.push(this.url);
        this.url = "";
    }

    onDeleteUrl(url: string) {
        this.urlList = this.urlList.filter(x => x !== url);
    }

    onUpload() {
        // TODO upload urls
    }
}