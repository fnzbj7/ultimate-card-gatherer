import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input } from '@angular/core';


@Component({
    selector: 'app-code-snipet',
    templateUrl: 'code-snipet.component.html'
})
export class CodeSnipetComponent {

    @Input() code!: string;
    @Input() fileName!: string;
    

    copy = true;

    constructor(
        private clipboard: Clipboard,
    ) {}


    copyToClipboard() {
        if (this.code) {
          this.copy = false;
          this.clipboard.copy(this.code);
          setTimeout(() => (this.copy = true), 650);
        }
      }
    
      copyFileName() {
        this.clipboard.copy('magic-cards-list.service.ts');
      }
}
