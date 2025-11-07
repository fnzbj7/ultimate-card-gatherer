import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { finishTask } from '../store/task.actions';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';
import { CompareCardDto, CompareCardService } from './compare-card.service';
import { KeyboardNavigationService } from './keyboard-navigation.service';

type BestNum = {
  [key: string]: number;
};

@Component({
  selector: 'app-compare-screen',
  templateUrl: './compare-screen.component.html',
  styleUrls: ['./compare-screen.component.css'],
})
export class CompareScreenComponent implements OnInit, OnDestroy {
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
  activeCardIndex = 0;
  showKeyboardHelp = false;
  private keyboardSubscription?: Subscription;

  constructor(
    private compareCardService: CompareCardService,
    //private cardUltimateService: CardUltimateService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private taskService: TaskService,
    private keyboardNav: KeyboardNavigationService,
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

    // Setup keyboard navigation
    this.keyboardSubscription = this.keyboardNav.commands$.subscribe((command) => {
      this.handleKeyboardCommand(command);
    });
  }

  ngOnDestroy() {
    if (this.keyboardSubscription) {
      this.keyboardSubscription.unsubscribe();
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

  getCardClasses(card: any, index: number): string {
    const issueClass = this.getIssueClass(card);
    const activeClass = this.isActiveCard(index)
      ? 'ring-4 ring-blue-500 ring-opacity-50 border-blue-500 shadow-xl scale-[1.02]'
      : '';
    return `${issueClass} ${activeClass}`.trim();
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

  private handleKeyboardCommand(command: any): void {
    if (!this.compareList?.cardMapping) {
      return;
    }

    const filteredCards = this.getFilteredCards();

    switch (command.action) {
      case 'next':
        this.navigateToCard(this.activeCardIndex + 1);
        break;

      case 'previous':
        this.navigateToCard(this.activeCardIndex - 1);
        break;

      case 'nextIssue':
        this.navigateToNextIssue(1);
        break;

      case 'prevIssue':
        this.navigateToNextIssue(-1);
        break;

      case 'first':
        this.navigateToCard(0);
        break;

      case 'last':
        this.navigateToCard(filteredCards.length - 1);
        break;

      case 'selectSuggested':
        this.selectSuggestedNumber();
        break;

      case 'selectNumber':
        this.selectNumberByIndex(command.value);
        break;

      case 'skip':
        this.skipCurrentCard();
        break;

      case 'submit':
        if (this.renameState === 'init') {
          this.onSubmit();
        }
        break;

      case 'toggleHelp':
        this.showKeyboardHelp = !this.showKeyboardHelp;
        break;
    }
  }

  private navigateToCard(index: number): void {
    const filteredCards = this.getFilteredCards();
    if (index < 0 || index >= filteredCards.length) {
      return;
    }

    this.activeCardIndex = index;
    this.scrollToActiveCard();
  }

  private navigateToNextIssue(direction: number): void {
    const filteredCards = this.getFilteredCards();
    let currentIndex = this.activeCardIndex;

    // Search for next issue
    for (let i = 0; i < filteredCards.length; i++) {
      currentIndex += direction;

      // Wrap around
      if (currentIndex >= filteredCards.length) {
        currentIndex = 0;
      } else if (currentIndex < 0) {
        currentIndex = filteredCards.length - 1;
      }

      if (filteredCards[currentIndex].hasIssue) {
        this.navigateToCard(currentIndex);
        break;
      }
    }
  }

  private scrollToActiveCard(): void {
    setTimeout(() => {
      const element = document.getElementById(`card-${this.activeCardIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 0);
  }

  private selectSuggestedNumber(): void {
    const filteredCards = this.getFilteredCards();
    const activeCard = filteredCards[this.activeCardIndex];

    if (activeCard && activeCard.suggestedNumber !== null) {
      this.myFormGroup.patchValue({
        [activeCard.img]: activeCard.suggestedNumber,
      });

      // Auto-advance to next card
      setTimeout(() => {
        this.navigateToCard(this.activeCardIndex + 1);
      }, 150);
    }
  }

  private selectNumberByIndex(index: number): void {
    const filteredCards = this.getFilteredCards();
    const activeCard = filteredCards[this.activeCardIndex];

    if (!activeCard) {
      return;
    }

    const possibleNumbers = this.findPossibleCardNumbers(activeCard.name);
    if (index > 0 && index <= possibleNumbers.length) {
      const selectedNumber = possibleNumbers[index - 1];
      this.myFormGroup.patchValue({
        [activeCard.img]: selectedNumber,
      });

      // Auto-advance to next card
      setTimeout(() => {
        this.navigateToCard(this.activeCardIndex + 1);
      }, 150);
    }
  }

  private skipCurrentCard(): void {
    const filteredCards = this.getFilteredCards();
    const activeCard = filteredCards[this.activeCardIndex];

    if (activeCard) {
      this.myFormGroup.patchValue({
        [activeCard.img]: null,
      });

      // Auto-advance to next card
      setTimeout(() => {
        this.navigateToCard(this.activeCardIndex + 1);
      }, 150);
    }
  }

  isActiveCard(index: number): boolean {
    return index === this.activeCardIndex;
  }

  isCardChecked(card: any): boolean {
    const value = this.myFormGroup.get(card.img)?.value;
    return value !== undefined && value !== null && value !== '';
  }

  isDifferentFromOcr(card: any): boolean {
    const selectedValue = this.myFormGroup.get(card.img)?.value;
    if (!selectedValue || !card.ocrNumber || card.ocrNumber.trim() === '') {
      return false;
    }
    const ocrNum = parseInt(card.ocrNumber);
    return selectedValue !== ocrNum;
  }

  onCardClick(index: number): void {
    this.navigateToCard(index);
  }

  getProgressText(): string {
    const filteredCards = this.getFilteredCards();
    return `Card ${this.activeCardIndex + 1}/${filteredCards.length}`;
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
