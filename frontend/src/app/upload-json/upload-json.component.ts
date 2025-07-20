import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { AppState } from '../store/task.reducer';
import { TaskService } from '../store/task.service';

@Component({
  selector: 'app-upload-json',
  templateUrl: 'upload-json.component.html',
})
export class UploadJsonComponent implements OnInit {
  selectedFile?: File;
  id?: string;
  setCode?: string;
  cards: any[] = [];
  missingNumbers: string[] = []; // Add this property

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private store: Store<AppState>,
    private taskService: TaskService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.store.pipe(select((state) => state.tasks)).subscribe((tasks) => {
      if (tasks.jsonBase) {
        const { jsonBase } = tasks;
        this.setCode = jsonBase.setCode;
        this.cards = jsonBase.mtgJson.data.cards || []; // Store cards from backend
        this.detectGaps();
      }
    });
    if (!this.taskService.id && this.id) {
      this.taskService.setId(+this.id);
    }
  }

  detectGaps(): void {
    if (!this.cards.length) {
      this.missingNumbers = [];
      return;
    }
    // Get all card numbers as strings
    const numbers = this.cards
      .map(card => card.number)
      .filter(num => !!num)
      .map(num => num.toString());

    // Convert to numbers and sort
    const numericNumbers = numbers
      .map(num => parseInt(num, 10))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);

    if (!numericNumbers.length) {
      this.missingNumbers = [];
      return;
    }

    const min = numericNumbers[0];
    const max = numericNumbers[numericNumbers.length - 1];
    const numberSet = new Set(numericNumbers);

    const missing: string[] = [];
    for (let i = min; i <= max; i++) {
      if (!numberSet.has(i)) {
        missing.push(i.toString());
      }
    }
    this.missingNumbers = missing;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const id = this.route.snapshot.params['id'];
      const formData = new FormData();
      formData.append('json', this.selectedFile);
      this.http.post(`/api/entity/json-base/${id}/update-json`, formData).subscribe();
    }
  }

  getCardChunks(cards: any[], columns: number): any[][] {
    const chunkSize = Math.ceil(cards.length / columns);
    const chunks = [];
    for (let i = 0; i < cards.length; i += chunkSize) {
      chunks.push(cards.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
