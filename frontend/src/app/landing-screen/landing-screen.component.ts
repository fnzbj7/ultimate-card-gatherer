import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { TaskService } from '../store/task.service';
import { JsonBaseDto } from '../dto/dto-collection';
import { Store } from '@ngrx/store';
import { AppState } from '../store/task.reducer';
import { setJsonBase } from '../store/task.actions';
import { map } from 'rxjs';

export interface MessageData {
  status: string;
  message: string;
  a: number;
}

@Component({
  selector: 'app-landing-screen',
  templateUrl: 'landing-screen.component.html',
  styleUrls: ['landing-screen.component.scss'],
})
export class LandingScreenComponent implements OnInit {
  jsonBaseArr!: JsonBaseDto[];
  private lastDeleteClickTime: number | null = null;
  private lastDeleteId: number | null = null;

  // fullMsg: string = 'START: ';

  constructor(
    private http: HttpClient,
    private router: Router,
    private taskService: TaskService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/entity/json-base/all/cards')
    .pipe(
      map((response: {iconModifDate: Date | string }[]) => {
        for(let r of response) {
          r.iconModifDate = new Date(r.iconModifDate);
        }
        
        return response as JsonBaseDto[];
      }))
    .subscribe((resp) => {
      this.jsonBaseArr = resp.reverse();
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    this.http
      .post<JsonBaseDto>('/api/entity/json-base/upload', formData)
      .subscribe((jsonBase) => {
        this.store.dispatch(setJsonBase({ jsonBase }));
        this.router.navigate(['hub', jsonBase.id]);
      });
  }

  onGoToHub(event: MouseEvent, { id }: { id: number; setCode: string }) {
    event.preventDefault();
    this.router.navigate(['hub', id]);
    this.taskService.setId(id);
  }

  onDelete(event: Event,id: number) {
    event.preventDefault();
    event.stopPropagation();

    const currentTime = Date.now();

    if (this.lastDeleteId === id && this.lastDeleteClickTime && currentTime - this.lastDeleteClickTime < 1000) {
      // If the second click happens within 1 second and the ID matches, proceed with deletion
      console.log(`Deleting item with ID: ${id}`);
      this.lastDeleteClickTime = null; // Reset the timer
      this.lastDeleteId = null; // Reset the ID
      // Add your delete logic here
      this.http.delete(`/api/entity/json-base/${id}`).subscribe(() => {
        this.jsonBaseArr = this.jsonBaseArr.filter((item) => item.id !== id);
      });
    } else {
      // First click or different ID: warn the user
      console.log('Click again within 1 second to confirm deletion.');
      this.lastDeleteClickTime = currentTime; // Set the timer
      this.lastDeleteId = id; // Set the ID
    }
  }
}
