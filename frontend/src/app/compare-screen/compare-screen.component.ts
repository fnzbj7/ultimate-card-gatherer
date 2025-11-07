import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { finishTask } from '../store/task.actions';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';
import { CompareCardDto, CompareCardService } from './compare-card.service';

type BestNum = {
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
  showOnlyIssues = false;

  constructor(
    private compareCardService: CompareCardService,
    //private cardUltimateService: CardUltimateService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private taskService: TaskService,
  ) {}

  ngOnInit() {
    this.compareList = this.compareCardService.compareList;
    this.id = this.route.snapshot.params['id'];

    this.store.pipe(select((state) => state.tasks)).subscribe((tasks) => {
      if (tasks.jsonBase) {
        const { jsonBase } = tasks;
        this.setCode = jsonBase.setCode;
      }
    });
    if (!this.taskService.id && this.id) {
      this.taskService.setId(+this.id);
    }

    if (this.compareList) {
      let group: { [key: string]: FormControl } = {};
      this.compareList.cardMapping.forEach((card) => {
        // Use suggested number if available, otherwise null
        group[card.img] = new FormControl(card.suggestedNumber);
      });
      this.myFormGroup = new FormGroup(group);
    } else {
      this.http.get<CompareCardDto>(`/api/entity/json-base/${this.id}/compare`).subscribe((x) => {
        this.compareList = x;
        this.setCode = this.compareList.setCode;
        let group: { [key: string]: FormControl } = {};
        this.compareList.cardMapping.forEach((card) => {
          // Use suggested number if available, otherwise null
          group[card.img] = new FormControl(card.suggestedNumber);
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

  getIssueClass(card: any): string {
    if (!card.hasIssue) return '';

    switch (card.issueType) {
      case 'missing_ocr':
        return 'border-yellow-500 bg-yellow-50';
      case 'duplicate':
        return 'border-orange-500 bg-orange-50';
      case 'ocr_mismatch':
        return 'border-red-500 bg-red-50';
      case 'no_available_numbers':
        return 'border-red-700 bg-red-100';
      default:
        return 'border-gray-500';
    }
  }

  getIssueText(card: any): string {
    if (!card.hasIssue) return '';

    switch (card.issueType) {
      case 'missing_ocr':
        return '⚠ Missing OCR number';
      case 'duplicate':
        return '⚠ Duplicate - OCR already used';
      case 'ocr_mismatch':
        return `⚠ OCR mismatch (OCR: ${card.ocrNumber})`;
      case 'no_available_numbers':
        return '❌ No available numbers for this card';
      default:
        return '⚠ Issue detected';
    }
  }

  getFilteredCards() {
    if (!this.compareList) return [];
    if (!this.showOnlyIssues) return this.compareList.cardMapping;
    return this.compareList.cardMapping.filter((card) => card.hasIssue);
  }

  getIssueCount(): number {
    if (!this.compareList) return 0;
    return this.compareList.cardMapping.filter((card) => card.hasIssue).length;
  }

  toggleIssueFilter() {
    this.showOnlyIssues = !this.showOnlyIssues;
  }

  onSubmit() {
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
        flipName = key.substring(0, key.lastIndexOf('.')) + '_F' + key.substring(key.lastIndexOf('.'));
      }

      cards.push({ imgName: key, flipName, isFlip, newNumber: value.value });
    }

    this.http.post<void>('api/rename', renameDto).subscribe(() => {
      // TODO store
      this.store.dispatch(finishTask({ taskId: 'isCheckNumberF' }));
      this.isRenameLoading = false;
      this.isRenameFinised = true;
      this.renameState = 'finished';
    });
  }
}
