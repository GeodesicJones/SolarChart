import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from "@angular/common/http";
import { IData } from "./data";
import { Observable } from "rxjs";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../environments/environment";
import { AuthService } from "./auth.service";
import * as _ from "lodash";

@Injectable({
  providedIn: "root"
})
export class DataService {
  private _apiEndpoint: string = environment.apiEndpoint;

  public get(name = "data2018"): Observable<IData[]> {
    return this._http
      .get<IData[]>(`${this._apiEndpoint}/?key=${name}.json`)
      .pipe(catchError(this.errorHandler));
  }

  private errorHandler(error: HttpErrorResponse) {
    return throwError(error.message);
  }

  public save(data, name = "data2018"): Observable<any> {
    data = _.sortBy(data, x => new Date(x.date));
    return this._http
      .post(
        `${this._apiEndpoint}`,
        {
          key: `${name}.json`,
          content: JSON.stringify(data, (key, value) => value)
        },
        { headers: new HttpHeaders({ authorization: this._authService.Token }) }
      )
      .pipe(catchError(this.errorHandler));
  }

  constructor(private _http: HttpClient, private _authService: AuthService) {}
}
