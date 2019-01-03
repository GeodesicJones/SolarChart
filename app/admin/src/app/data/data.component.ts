import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DataService } from "../data.service";
import { AuthService } from "../auth.service";
import { IData } from "../data";
import * as _ from "lodash";

@Component({
  selector: "app-data",
  templateUrl: "./data.component.html",
  styleUrls: [
    "../app.component.css",
    "./data.component.css",
    "../../assets/typicons.min.css"
  ]
})
export class DataComponent implements OnInit {
  constructor(
    private _dataService: DataService,
    private _authService: AuthService,
    private _router: Router
  ) {
    if (!this._authService.isLoggedIn) {
      this._router.navigateByUrl("/login");
    }
  }

  data: IData[];

  remove(row) {
    this.data = this.data.filter(function(value) {
      return value != row;
    });
    this.save();
  }

  save() {
    this._dataService
      .save(this.data)
      .subscribe(() => {}, error => (this.errorMsg = error));
  }

  newRow() {
    this.data.unshift({
      date: new Date(),
      dial: 0,
      code14: 0,
      code24: 0
    });
  }

  errorMsg: string;
  ngOnInit() {
    this._dataService
      .get()
      .subscribe(
        data => (this.data = _.sortBy(data, x => x.date).reverse()),
        error => (this.errorMsg = error)
      );
  }
}
