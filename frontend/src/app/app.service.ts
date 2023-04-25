import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class AppService {

    id?: number;
    setCode?: string;

    getSetCode() {
        return this.setCode;
    }

    setSetCode(setCode: string) {
        this.setCode = setCode;
    }

}
