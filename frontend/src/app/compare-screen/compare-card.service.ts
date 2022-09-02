import {Injectable} from "@angular/core";
import {CompareCardDto} from "../dto/compare-card.dto";

@Injectable({providedIn: 'root'})
export class CompareCardService {
  compareList: CompareCardDto;
}
