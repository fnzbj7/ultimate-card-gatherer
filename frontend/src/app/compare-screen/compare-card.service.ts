import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CompareCardService {
  compareList?: CompareCardDto;
}

export interface CompareCardDto {
  cardMapping: { img: string; name: string; hasBack: boolean }[];
  reducedCardArray: { name: string; nums: number[] }[];
  setCode: string;
}
