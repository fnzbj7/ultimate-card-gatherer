import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { TaskService } from '../store/task.service';

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
  jsonArr!: { id: number; setCode: string; version: string }[];

  // fullMsg: string = 'START: ';

  constructor(
    private http: HttpClient,
    private appService: AppService,
    private router: Router,
    private taskService: TaskService,
  ) {}

  ngOnInit(): void {
    this.http.get<{ id: number; setCode: string; version: string }[]>('/api/updated-urls').subscribe((x) => {
      this.jsonArr = x;
      console.log({ x });
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
      .post<{ id: number; setCode: string; version: string }>('/api/entity/json-base/upload', formData)
      .subscribe((resp) => {
        console.log({ resp });
        this.appService.setSetCode(resp.setCode);
        this.appService.id = resp.id;
        this.router.navigate(['hub', resp.id]);
      });
  }

  onGoToHub(event: MouseEvent, { id, setCode }: { id: number; setCode: string }) {
    event.preventDefault();
    this.appService.id = id;
    this.appService.setCode = setCode;
    this.router.navigate(['hub', id]);
    this.taskService.setId(id);
  }
}
