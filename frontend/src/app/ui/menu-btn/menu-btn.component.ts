import { Component, Input } from '@angular/core';

@Component({
    selector: 'div[app-menu-btn]',
    templateUrl: 'menu-btn.component.html'
})
export class MenuBtnComponent {

    @Input() id!: string;
    @Input() menuText!: string;
    @Input() navLovation!: string;
    @Input() isDone!: boolean;
}