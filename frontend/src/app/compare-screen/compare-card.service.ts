import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CompareCardService {
  compareList?: CompareCardDto;
}

export interface CompareCardDto {
  cardMapping: EnhancedCardMapping[];
  reducedCardArray: { name: string; nums: number[] }[];
  setCode: string;
  maxExpectedNumber: number;
  summary: {
    issueCount: number;
    autoArtCount: number;
    autoTokenCount: number;
    excludedCount: number;
  };
}

export interface EnhancedCardMapping {
  img: string;
  name: string;
  hasBack: boolean;
  ocrNumber: string;
  suggestedNumber: number | null;
  selectedNumber: number | null;
  hasIssue: boolean;
  issueType?: 'missing_ocr' | 'ocr_mismatch' | 'duplicate' | 'no_available_numbers';
  excludeState: 'unset' | 'include' | 'exclude';
  excludeReason?: 'manual' | 'auto_keyword_art' | 'auto_keyword_token';
  autoTagType: 'art' | 'token' | null;
  isExcluded: boolean;
}
