import {Component, OnInit} from "@angular/core";
import {CompareCardService} from "./compare-card.service";
import {CompareCardDto} from "../dto/compare-card.dto";
import {FormControl, FormGroup} from "@angular/forms";
import {RenameDto} from "../dto/rename.dto";
import {CardUltimateService} from "../card-ultimate.service";

@Component({
  selector: 'app-compare-screen',
  templateUrl: './compare-screen.component.html',
  styleUrls: ['./compare-screen.component.css']
})
export class CompareScreenComponent implements OnInit {

  myFormGroup: FormGroup;
  compareList: CompareCardDto;
  jsonName: string

  constructor(private compareCardService: CompareCardService,
              private cardUltimateService: CardUltimateService) {
  }

  ngOnInit() {
    this.compareList = this.compareCardService.compareList;
    this.jsonName = this.compareCardService.jsonName;
    let group = {};
    let bestNum = {}
    this.compareList.cardArray.forEach(input_template=>{
      if(!bestNum[input_template.cardName]) {
        bestNum[input_template.cardName] = 0;
      }
      group[input_template.imgName]= new FormControl(this.findPossibleCardNumbers(input_template.cardName)[bestNum[input_template.cardName]++]);
    });
    this.myFormGroup = new FormGroup(group);
  }

  findPossibleCardNumbers(cardName: string): number[] {
    return this.compareList.reducedCardArray.find(x => x.name === cardName).nums;
  }

  onSubmit() {
    console.log(this.myFormGroup);

    let cards: {imgName: string, flipName: string, isFlip: boolean, newNumber: string}[] = [];

    let renameDto: RenameDto = {jsonName: this.jsonName,
      setName: this.jsonName.split('-')[0],
      cards}

    for (const [key, value] of Object.entries(this.myFormGroup.controls)) {
      let isFlip = this.compareList.cardArray.find(x => x.imgName === key).isFlip;
      let flipName = null;
      if(isFlip) {
        flipName = key.split('.png')[0] + '_F.png';
      }

      cards.push({imgName: key,
        flipName,
        isFlip,
        newNumber: value.value}
      );
    }

    this.cardUltimateService.sendRenameCards(renameDto).subscribe(() => {
      console.log('végzett');
    });
  }
}
