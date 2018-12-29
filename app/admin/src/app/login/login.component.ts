import { Component, OnInit } from "@angular/core";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../app.component.css", "./login.component.css"]
})
export class LoginComponent implements OnInit {
  constructor(private _authService: AuthService, private _router: Router) {}

  user: string;
  password: string;
  errorMsg: string;

  login() {
    this._authService.login(this.user, this.password).subscribe(
      loggedIn => {
        if (loggedIn) {
          this._router.navigateByUrl("/data");
        }
      },
      error => (this.errorMsg = error)
    );
  }

  ngOnInit() {}
}
