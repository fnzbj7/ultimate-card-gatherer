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
      this.jsonBaseArr = resp;
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
}
