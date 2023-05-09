import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-breadcumb',
    templateUrl: 'breadcrumb.component.html',
    styleUrls: ['breadcrumb.component.scss']
})
export class BreadcrumbComponent {
    @Input() id?: string;
    @Input() setCode?: string;
    @Input() subMenu?: string;

}
