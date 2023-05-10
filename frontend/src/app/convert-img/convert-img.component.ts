import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-convert-img',
    templateUrl: 'convert-img.component.html'
})
export class ConvertImgComponent implements OnInit {

    id!: string;

    constructor(
        private readonly route: ActivatedRoute
    ){}
    
    ngOnInit(): void {
        this.id = this.route.snapshot.params["id"];
    }

}
