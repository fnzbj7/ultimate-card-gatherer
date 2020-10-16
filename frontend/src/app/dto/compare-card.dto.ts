export class CompareCardDto {
  cardArray: {imgName: string, cardName: string, isFlip: boolean}[];
  reducedCardArray: {name: string, nums: number[]}[];
}
