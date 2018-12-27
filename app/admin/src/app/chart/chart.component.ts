import { Component, OnInit } from "@angular/core";
import * as moment from "moment";
import { forkJoin } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Chart } from "chart.js";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"]
})
export class ChartComponent implements OnInit {
  constructor(private _http: HttpClient) {}
  private dataUrl2016 = `${environment.apiEndpoint}?key=data2016.json`;
  private dataUrl2018 = `${environment.apiEndpoint}?key=data2018.json`;

  makeSeries(rawData) {
    var seriesData = [];
    for (var i = 1; i < rawData.length; i++) {
      var currentDayOfYear = moment(rawData[i].date, "MM/DD/YYYY").dayOfYear();
      var previousDayOfYear = moment(
        rawData[i - 1].date,
        "MM/DD/YYYY"
      ).dayOfYear();
      var currentCumulativeProduction = rawData[i].dial;
      var previousCumulativeProduction = rawData[i - 1].dial;
      var averageDailyProduction =
        (currentCumulativeProduction - previousCumulativeProduction) /
        (currentDayOfYear - previousDayOfYear);

      seriesData.push({
        x: currentDayOfYear,
        y: averageDailyProduction
      });
    }

    return seriesData;
  }

  makeCharts(data2016, data2018) {
    Chart.defaults.global.elements.point.pointStyle = "triangle";
    new Chart("canvas", {
      responsive: true,
      type: "line",
      data: {
        datasets: [
          {
            label: "2018",
            fill: false,
            data: data2018,
            backgroundColor: ["rgba(79,129,189,1)"],
            borderColor: ["rgba(79,129,189,1)"],
            borderWidth: 1
          },
          {
            label: "2016",
            fill: false,
            data: data2016,
            backgroundColor: ["rgba(155,187,89,1)"],
            borderColor: ["rgba(155,187,89,1)"],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: "average kwh/day, by week"
        },
        legend: {
          position: "right"
        },
        scales: {
          xAxes: [
            {
              type: "linear",
              display: true,
              position: "bottom",
              ticks: {
                callback: function(value, index, values) {
                  let months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec"
                  ];
                  var date = moment().dayOfYear(value);
                  if (date.date() == 1) {
                    return months[date.month()];
                  }
                  return null;
                },
                beginAtZero: true,
                autoSkip: false,
                stepSize: 1
              }
            }
          ],
          yAxes: [
            {
              display: true,
              ticks: {
                min: 0,
                max: 16,
                stepSize: 2
              }
            }
          ]
        }
      }
    });
  }

  ngOnInit() {
    forkJoin(
      this._http.get(this.dataUrl2016),
      this._http.get(this.dataUrl2018)
    ).subscribe(res => {
      var series2016 = this.makeSeries(res[0]);
      var series2018 = this.makeSeries(res[1]);
      this.makeCharts(series2016, series2018);
    });
  }
}
