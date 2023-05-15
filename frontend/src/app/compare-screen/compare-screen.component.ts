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
  errArr?: string[];
  renameState: 'init' | 'load' | 'finished' = 'init';
  isRenameLoading = false;
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
    private appService: AppService,
  ) {}

  ngOnInit() {
    this.compareList = this.compareCardService.compareList;
    this.id = this.route.snapshot.params['id'];

    // this.jsonName = this.route.snapshot.params.jsonName;

    if (this.compareList) {
      let group: { [key: string]: FormControl } = {};
      let bestNum: MyType = {};
      let bestNumMap = new Map<string, number>();
      this.compareList.cardMapping.forEach((input_template) => {
        if (!bestNum[input_template.name]) {
          bestNum[input_template.name] = 0;
          bestNumMap.set(input_template.name, 0);
        }
        group[input_template.img] = new FormControl(
          this.findPossibleCardNumbers(input_template.name)[bestNum[input_template.name]++],
        );
      });
      this.myFormGroup = new FormGroup(group);
    } else {
      this.http.get<CompareCardDto>(`/api/entity/json-base/${this.id}/compare`).subscribe((x) => {
        this.compareList = x;
        this.setCode = this.compareList.setCode;
        let group: { [key: string]: FormControl } = {};
        let bestNum: MyType = {};
        this.compareList.cardMapping.forEach((input_template) => {
          if (!bestNum[input_template.name]) {
            bestNum[input_template.name] = 0;
          }
          group[input_template.img] = new FormControl(
            this.findPossibleCardNumbers(input_template.name)[bestNum[input_template.name]++],
          );
        });
        this.myFormGroup = new FormGroup(group);
      });
    }
  }

  findPossibleCardNumbers(cardName: string): number[] {
    if (this.compareList) {
      const f = this.compareList.reducedCardArray.find((x) => x.name === cardName);
      return f ? f.nums : [];
    } else {
      return [];
    }
  }

  onSubmit() {
    console.log(this.myFormGroup);

    this.renameState = 'load';
    this.isRenameLoading = true;

    let cards: {
      imgName: string;
      flipName?: string;
      isFlip: boolean;
      newNumber: string;
    }[] = [];

    let renameDto = {
      id: this.id,
      cards,
    };

    for (const [key, value] of Object.entries(this.myFormGroup.controls)) {
      let isFlip = this.compareList?.cardMapping.find((x) => x.img === key)?.hasBack ?? false;
      let flipName = undefined;
      if (isFlip) {
        flipName = key.split('.png')[0] + '_F.png';
      }

      cards.push({ imgName: key, flipName, isFlip, newNumber: value.value });
    }

    this.http.post<void>('api/rename', renameDto).subscribe(() => {
      console.log('végzett a rename');
      this.isRenameLoading = false;
      this.isRenameFinised = true;
      this.renameState = 'finished';
    });
  }
}
