import {Component, OnInit} from "@angular/core";
import {CardUltimateService} from "../card-ultimate.service";
import {Router} from "@angular/router";
import {CompareCardService} from "../compare-screen/compare-card.service";

@Component({
  selector: 'app-download-screen',
  templateUrl: './download-screen.component.html'
})
export class DownloadScreenComponent implements OnInit  {
  jsonName: string;
  jsonList: string[] = [];
  url: string;
  urlList: string[] = [];
  isLoading = false;

  constructor(private cardUltimateService: CardUltimateService, private router: Router, private compareCardService: CompareCardService) {}

  ngOnInit() {
    this.cardUltimateService.getJsonList().subscribe(jsonList => this.jsonList = jsonList)
  }

  onSelectJson(json) {
    this.jsonName = json;
  }

  onAddingUrl() {
    this.urlList.push(this.url);
    this.url = "";
  }

  onDeleteUrl(url: string) {
    this.urlList = this.urlList.filter(x => x !== url);
  }

  onSendToBackend() {
    this.isLoading = true;
    this.cardUltimateService.sendJsonToDownload(this.jsonName, this.urlList).subscribe(x => {
      this.isLoading = false;
      this.compareCardService.compareList = x;
      this.compareCardService.jsonName = this.jsonName;
      console.log(x);
      // TODO feltölteni a service-t
      this.router.navigate(['compare']);
    })
  }
}
