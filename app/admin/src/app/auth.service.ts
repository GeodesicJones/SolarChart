import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private _apiEndpoint: string = `${environment.apiEndpoint}/authenticate`;
  public Token: string = null;

  public get isLoggedIn() {
    return this.Token !== null;
  }

  public login(userid, password) {
    return new Observable(observer => {
      this._http
        .post(this._apiEndpoint, { userid: userid, password: password })
        .subscribe(
          data => {
            this.Token = data.toString();
            observer.next(true);
          },
          () => observer.error("Login failed; please try again.")
        );
    });
  }

  constructor(private _http: HttpClient) {}
}
