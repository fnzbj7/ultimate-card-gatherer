import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {CompareCardDto} from "./dto/compare-card.dto";
import {RenameDto} from "./dto/rename.dto";

@Injectable({providedIn: 'root'})
export class CardUltimateService {

  constructor(private http: HttpClient) {
  }

  getJsonList(): Observable<string[]>  {
    return this.http.get<string[]>("http://localhost:3000/json");
  }

  sendJsonToDownload(jsonName: string, imgUrls: string[]): Observable<CompareCardDto> {
    return this.http.put<CompareCardDto>("http://localhost:3000/download", {imgUrls, jsonName});
  }

  sendRenameCards(renameDto: RenameDto): Observable<void> {
    return this.http.post<void>("http://localhost:3000/rename", renameDto);
  }
}