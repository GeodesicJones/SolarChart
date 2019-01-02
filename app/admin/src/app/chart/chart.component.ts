import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../data.service";

declare var makeProductionSeries;
declare var makeConsumptionSeries;
declare var makeCharts;

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"]
})
export class ChartComponent implements OnInit {
  constructor(private _dataService: DataService, private _http: HttpClient) {}

  ngOnInit() {
    this._dataService.get("data2019").subscribe(res => {
      var seriesProduced = makeProductionSeries(res);
      var seriesConsumed = makeConsumptionSeries(res);
      makeCharts(seriesProduced, seriesConsumed);
    });
  }
}
