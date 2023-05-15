import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { JsonBaseDto } from '../dto/dto-collection';
import { setJsonBase } from './task.actions';
import { Store } from '@ngrx/store';
import { AppState } from './task.reducer';

@Injectable({providedIn: 'root'})
export class TaskService {

    id?: number

    constructor(
        private readonly http: HttpClient,
        private store: Store<AppState>
    ) {}

    setId(id: number) {
        this.id = id;
        this.http.get<JsonBaseDto>(`/api/entity/json-base/${id}/full`).subscribe(jsonBase => {
            this.store.dispatch(setJsonBase({ jsonBase }));
        });
    }
}
