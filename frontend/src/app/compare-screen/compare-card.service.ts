import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CompareCardService {
  compareList?: CompareCardDto;
}

export interface CompareCardDto {
  cardMapping: EnhancedCardMapping[];
  reducedCardArray: { name: string; nums: number[] }[];
  setCode: string;
}

export interface EnhancedCardMapping {
  img: string;
  name: string;
  hasBack: boolean;
  ocrNumber: string;
  suggestedNumber: number | null;
  hasIssue: boolean;
  issueType?: 'missing_ocr' | 'ocr_mismatch' | 'duplicate' | 'no_available_numbers';
}
