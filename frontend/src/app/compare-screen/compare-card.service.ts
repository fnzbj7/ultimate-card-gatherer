import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class CompareCardService {
  compareList?: CompareCardDto;
}

export interface CompareCardDto {
  cardArray: {imgName: string, cardName: string, isFlip: boolean}[];
  reducedCardArray: {name: string, nums: number[]}[];
}
