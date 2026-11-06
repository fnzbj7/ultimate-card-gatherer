import { ExcludeReason, ExcludeState } from 'src/entities/entities/json-base.entity';

export class CompareCardDecisionDto {
    img: string;
    selectedNumber: number | null;
    excludeState?: ExcludeState;
    excludeReason?: ExcludeReason;
}

export class UpdateCompareDecisionsDto {
    decisions: CompareCardDecisionDto[];
}
