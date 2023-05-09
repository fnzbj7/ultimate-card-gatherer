import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { JsonBaseDto } from './dto/dto-collection';

@Injectable({providedIn: 'root'})
export class AppService {

    id?: number;
    setCode?: string;

    constructor(private http: HttpClient) {}

    getSetCode() {
        return this.setCode;
    }

    setSetCode(setCode: string) {
        this.setCode = setCode;
    }

    getSingleJsonBase(id: string) {
        return this.http.get<JsonBaseDto>(`/api/entity/json-base/${id}/full`);
    }

}
