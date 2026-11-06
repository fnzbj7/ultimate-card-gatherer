import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { finishTask } from '../store/task.actions';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';
import { CompareCardDto, CompareCardService, EnhancedCardMapping } from './compare-card.service';
import { KeyboardCommand, KeyboardNavigationService } from './keyboard-navigation.service';

type FilterMode = 'all' | 'issues';

type NumberAuditStatus = 'mapped' | 'missing' | 'duplicate';

interface NumberAuditRow {
  number: number;
  mappedCards: EnhancedCardMapping[];
  status: NumberAuditStatus;
}

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
  filterMode: FilterMode = 'all';
  activeCardIndex = 0;
  showKeyboardHelp = false;
  showMissingNumbers = false;
  showAutoTagged = true;
  showExcluded = true;
  includeExcludedInAudit = false;
  decisionSaveState: 'idle' | 'saving' | 'saved' | 'error' = 'idle';
  decisionSaveError = '';
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
      this.initializeForm(this.compareList);
    } else {
      this.http.get<CompareCardDto>(`/api/entity/json-base/${this.id}/compare`).subscribe((x) => {
        this.compareList = x;
        this.setCode = this.compareList.setCode;
        this.initializeForm(this.compareList);
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

  private initializeForm(compareList: CompareCardDto): void {
    const group: { [key: string]: FormControl } = {};
    compareList.cardMapping.forEach((card) => {
      group[card.img] = new FormControl(card.selectedNumber);
    });
    this.myFormGroup = new FormGroup(group);
  }

  findPossibleCardNumbers(cardName: string): number[] {
    if (this.compareList) {
      const f = this.compareList.reducedCardArray.find((x) => x.name === cardName);
      return f ? f.nums : [];
    } else {
      return [];
    }
  }

  getIssueClass(card: EnhancedCardMapping): string {
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

  getCardClasses(card: EnhancedCardMapping, index: number): string {
    const issueClass = this.getIssueClass(card);
    const activeClass = this.isActiveCard(index)
      ? 'ring-4 ring-blue-500 ring-opacity-50 border-blue-500 shadow-xl scale-[1.02]'
      : '';
    const excludedClass = card.isExcluded ? 'opacity-70 border-dashed border-gray-500 bg-gray-50' : '';
    return `${issueClass} ${activeClass} ${excludedClass}`.trim();
  }

  getIssueText(card: EnhancedCardMapping): string {
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

  getFilteredCards(): EnhancedCardMapping[] {
    if (!this.compareList) return [];

    const cards = this.filterMode === 'issues'
      ? this.compareList.cardMapping.filter((card) => card.hasIssue)
      : this.compareList.cardMapping;

    return cards.filter(
      (card) =>
        (this.showAutoTagged || card.autoTagType === null) &&
        (this.showExcluded || !card.isExcluded),
    );
  }

  getIssueCount(): number {
    if (!this.compareList) return 0;
    return this.compareList.cardMapping.filter((card) => card.hasIssue).length;
  }

  setFilterMode(mode: FilterMode): void {
    this.filterMode = mode;
    this.keepActiveCardInRange();
  }

  setCardVisibility(): void {
    this.keepActiveCardInRange();
  }

  private keepActiveCardInRange(): void {
    const filteredCards = this.getFilteredCards();
    if (this.activeCardIndex >= filteredCards.length) {
      this.activeCardIndex = Math.max(filteredCards.length - 1, 0);
    }
  }

  private handleKeyboardCommand(command: KeyboardCommand): void {
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
        if (command.value !== undefined) {
          this.selectNumberByIndex(command.value);
        }
        break;

      case 'selectNope':
        this.selectNopeOption();
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
      activeCard.selectedNumber = activeCard.suggestedNumber;

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
      activeCard.selectedNumber = selectedNumber;

      // Auto-advance to next card
      setTimeout(() => {
        this.navigateToCard(this.activeCardIndex + 1);
      }, 150);
    }
  }

  private selectNopeOption(): void {
    const filteredCards = this.getFilteredCards();
    const activeCard = filteredCards[this.activeCardIndex];

    if (activeCard) {
      this.myFormGroup.patchValue({
        [activeCard.img]: null,
      });
      activeCard.selectedNumber = null;
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
      activeCard.selectedNumber = null;

      // Auto-advance to next card
      setTimeout(() => {
        this.navigateToCard(this.activeCardIndex + 1);
      }, 150);
    }
  }

  isActiveCard(index: number): boolean {
    return index === this.activeCardIndex;
  }

  isCardChecked(card: EnhancedCardMapping): boolean {
    const value = this.getCardControlValue(card.img);
    return value !== undefined && value !== null && value !== '';
  }

  isDifferentFromOcr(card: EnhancedCardMapping): boolean {
    const selectedValue = this.getCardControlValue(card.img);
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
    if (filteredCards.length === 0) {
      return 'Card 0/0';
    }
    return `Card ${this.activeCardIndex + 1}/${filteredCards.length}`;
  }

  private getCardControlValue(img: string): unknown {
    return this.myFormGroup.controls[img]?.value;
  }

  toggleExcludeForCard(card: EnhancedCardMapping): void {
    if (card.excludeState === 'unset') {
      card.excludeState = 'exclude';
      card.excludeReason = 'manual';
      card.isExcluded = true;
      return;
    }

    if (card.excludeState === 'exclude') {
      card.excludeState = 'include';
      card.excludeReason = 'manual';
      card.isExcluded = false;
      return;
    }

    card.excludeState = 'unset';
    card.excludeReason =
      card.autoTagType === 'art' ? 'auto_keyword_art' : card.autoTagType === 'token' ? 'auto_keyword_token' : undefined;
    card.isExcluded = card.autoTagType !== null;
  }

  getExcludeButtonClass(card: EnhancedCardMapping): string {
    if (card.excludeState === 'exclude') {
      return 'bg-red-100 text-red-700 border border-red-300';
    }
    if (card.excludeState === 'include') {
      return 'bg-green-100 text-green-700 border border-green-300';
    }
    if (card.autoTagType !== null) {
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    }
    return 'bg-white text-gray-700 border border-gray-300';
  }

  getExcludeButtonText(card: EnhancedCardMapping): string {
    if (card.excludeState === 'exclude') {
      return 'Excluded';
    }
    if (card.excludeState === 'include') {
      return 'Included';
    }
    if (card.autoTagType !== null) {
      return card.autoTagType;
    }
    return 'Neutral';
  }

  saveDecisions(): void {
    if (!this.compareList) {
      return;
    }

    this.decisionSaveState = 'saving';
    this.decisionSaveError = '';

    const decisions = this.compareList.cardMapping.map((card) => ({
      img: card.img,
      selectedNumber: this.normalizeControlValue(this.getCardControlValue(card.img)),
      excludeState: card.excludeState,
      excludeReason: card.excludeReason,
    }));

    this.http
      .patch<{ saved: number }>(`/api/entity/json-base/${this.id}/compare-decisions`, {
        decisions,
      })
      .subscribe({
        next: () => {
          this.decisionSaveState = 'saved';
        },
        error: () => {
          this.decisionSaveState = 'error';
          this.decisionSaveError = 'Unable to save compare decisions.';
        },
      });
  }

  getNumberAuditRows(): NumberAuditRow[] {
    if (!this.compareList) {
      return [];
    }

    const maxNumber = this.compareList.maxExpectedNumber ?? 0;
    const rows: NumberAuditRow[] = [];
    for (let num = 1; num <= maxNumber; num++) {
      const mappedCards = this.compareList.cardMapping.filter((card) => {
        if (!this.includeExcludedInAudit && card.isExcluded) {
          return false;
        }
        return this.normalizeControlValue(this.getCardControlValue(card.img)) === num;
      });

      let status: NumberAuditStatus = 'mapped';
      if (mappedCards.length === 0) {
        status = 'missing';
      } else if (mappedCards.length > 1) {
        status = 'duplicate';
      }

      rows.push({
        number: num,
        mappedCards,
        status,
      });
    }

    return rows;
  }

  getMissingNumberRows(): NumberAuditRow[] {
    return this.getNumberAuditRows().filter((row) => row.status === 'missing');
  }

  getDuplicateNumberRows(): NumberAuditRow[] {
    return this.getNumberAuditRows().filter((row) => row.status === 'duplicate');
  }

  private normalizeControlValue(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return parsed;
  }

  onSubmit() {
    this.renameState = 'load';
    this.isRenameLoading = true;

    let cards: {
      imgName: string;
      flipName?: string;
      isFlip: boolean;
      newNumber: string | null;
    }[] = [];

    let renameDto = {
      id: this.id,
      cards,
    };

    for (const [key, value] of Object.entries(this.myFormGroup.controls)) {
      const card = this.compareList?.cardMapping.find((x) => x.img === key);
      if (card?.isExcluded) {
        continue;
      }

      const isFlip = card?.hasBack ?? false;
      let flipName = undefined;
      if (isFlip) {
        flipName = key.substring(0, key.lastIndexOf('.')) + '_F' + key.substring(key.lastIndexOf('.'));
      }

      const normalizedValue = this.normalizeControlValue(value.value);

      cards.push({ imgName: key, flipName, isFlip, newNumber: normalizedValue === null ? null : `${normalizedValue}` });
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
