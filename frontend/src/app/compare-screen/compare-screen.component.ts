import { Component, OnInit } from '@angular/core';
import { CompareCardDto, CompareCardService } from './compare-card.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../app.service';


// export interface CompareCardDto {
//   cardArray: {imgName: string, cardName: string, isFlip: boolean}[];
//   reducedCardArray: {name: string, nums: number[]}[];
// }

type MyType = {
  [key: string]: number;
};

@Component({
  selector: 'app-compare-screen',
  templateUrl: './compare-screen.component.html',
  styleUrls: ['./compare-screen.component.css'],
})
export class CompareScreenComponent implements OnInit {
  myFormGroup!: FormGroup;
  compareList?: CompareCardDto;
  
  quality = '65-80';
  errArr?: string[];
  isRenameFinised = false;
  isResizeDone = false;
  isConvertWebpDone = false;
  id!: string;
  setCode: string = '';

  constructor(
    private compareCardService: CompareCardService,
    //private cardUltimateService: CardUltimateService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private appService: AppService 
  ) {}

  ngOnInit() {
    this.compareList = this.compareCardService.compareList;
    this.id = this.route.snapshot.params['id'];

    // this.jsonName = this.route.snapshot.params.jsonName;

    if(this.compareList) {
      let group: {[key: string]: FormControl} = {};
      let bestNum: MyType = {};
      let bestNumMap = new Map<string, number>();
      this.compareList.cardMapping.forEach((input_template) => {
        if (!bestNum[input_template.name]) {
          bestNum[input_template.name] = 0;
          bestNumMap.set(input_template.name, 0) 
        }
        group[input_template.img] = new FormControl(
          this.findPossibleCardNumbers(input_template.name)[
            bestNum[input_template.name]++
            //bestNumMap.set(input_template.cardName, bestNumMap.get(input_template.cardName)++)
          ]
        );
      });
      this.myFormGroup = new FormGroup(group);
    } else {
      this.http.get<CompareCardDto>(`/api/entity/json-base/${this.id}/compare`).subscribe(x => {
        this.compareList = x;
        this.setCode = this.compareList.setCode;
        let group: {[key: string]: FormControl} = {};
        let bestNum: MyType  = {};
        this.compareList.cardMapping.forEach((input_template) => {
          if (!bestNum[input_template.name]) {
            bestNum[input_template.name] = 0;
          }
          group[input_template.img] = new FormControl(
            this.findPossibleCardNumbers(input_template.name)[
              bestNum[input_template.name]++
            ]
          );
        });
        this.myFormGroup = new FormGroup(group);
        
      });

    }
  }

  findPossibleCardNumbers(cardName: string): number[] {
    if(this.compareList) {
      const f = this.compareList.reducedCardArray.find((x) => x.name === cardName)
      return f ? f.nums : [];
    } else {
      return [];
    }

    
  }

  onSubmit() {

    //TODO Átalakítni a mostani módszerre
    // console.log(this.myFormGroup);

    // let cards: {
    //   imgName: string;
    //   flipName: string;
    //   isFlip: boolean;
    //   newNumber: string;
    // }[] = [];

    // let renameDto = {
    //   jsonName: this.jsonName,
    //   setName: this.jsonName.split('-')[0],
    //   cards,
    // };

    // for (const [key, value] of Object.entries(this.myFormGroup.controls)) {
    //   let isFlip = this.compareList.cardArray.find(
    //     (x) => x.imgName === key
    //   ).isFlip;
    //   let flipName = null;
    //   if (isFlip) {
    //     flipName = key.split('.png')[0] + '_F.png';
    //   }

    //   cards.push({ imgName: key, flipName, isFlip, newNumber: value.value });
    // }

    // this.cardUltimateService.sendRenameCards(renameDto).subscribe(() => {
    //   console.log('végzett a rename');
    //   this.isRenameFinised = true;
    // });
  }

  onResize() {
    // TODO lehet ezt ki kéne innen venni
    // this.cardUltimateService
    //   .resizeCard(this.jsonName, this.quality)
    //   .subscribe((errArr) => {
    //     this.errArr = errArr;
    //     console.log('végzett RESIZE');
    //     this.isResizeDone = true;
    //   });
  }

  onConvertToWebp() {
    // TODO lehet ezt ki kéne innen venni
    // this.cardUltimateService.convertToWebp(this.jsonName).subscribe(() => {
    //   console.log('végzett webp');
    //   this.isConvertWebpDone = true;
    // });
  }
}
