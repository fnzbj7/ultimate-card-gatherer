import { Component, OnInit } from '@angular/core';
import { CompareCardDto, CompareCardService } from './compare-card.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { TaskService } from '../store/task.service';
import { AppState } from '../store/task.reducer';
import { finishTask } from '../store/task.actions';

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

  constructor(
    private compareCardService: CompareCardService,
    //private cardUltimateService: CardUltimateService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private taskService: TaskService
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

    // this.jsonName = this.route.snapshot.params.jsonName;

    if (this.compareList) {
      let group: { [key: string]: FormControl } = {};
      let bestNum: BestNum = {};
      let bestNumMap = new Map<string, number>();
      this.compareList.cardMapping.forEach((input_template) => {
        if (!bestNum[input_template.name]) {
          bestNum[input_template.name] = 0;
          bestNumMap.set(input_template.name, 0);
        }
        group[input_template.img] = new FormControl(
          this.findPossibleCardNumbers(input_template.name)[bestNum[input_template.name]++],
        );
      });
      this.myFormGroup = new FormGroup(group);
    } else {
      this.http.get<CompareCardDto>(`/api/entity/json-base/${this.id}/compare`).subscribe((x) => {
        this.compareList = x;
        this.setCode = this.compareList.setCode;
        let group: { [key: string]: FormControl } = {};
        let bestNum: BestNum = {};
        this.compareList.cardMapping.forEach((input_template) => {
          if (!bestNum[input_template.name]) {
            bestNum[input_template.name] = 0;
          }
          group[input_template.img] = new FormControl(
            this.findPossibleCardNumbers(input_template.name)[bestNum[input_template.name]++],
          );
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
