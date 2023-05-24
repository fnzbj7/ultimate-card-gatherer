import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-loading-bar',
  templateUrl: './loading-bar.component.html',
  styleUrls: ['./loading-bar.component.scss'],
})
export class LoadingBarComponent implements OnChanges {
  progress: number = 0;
  @Input() maxProcess: number = 0;
  @Input() finishedProcess: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.maxProcess != 0) {
      this.progress = (this.finishedProcess / this.maxProcess) * 100;
    }
  }
}
