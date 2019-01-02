import { Component, OnInit } from "@angular/core";
import * as moment from "moment";
import { HttpClient } from "@angular/common/http";
import { Chart } from "chart.js";
import { DataService } from "../data.service";

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"]
})
export class ChartComponent implements OnInit {
  constructor(private _dataService: DataService, private _http: HttpClient) {}

  makeProductionSeries(rawData) {
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

  makeConsumptionSeries(rawData) {
    var seriesData = [];
    for (var i = 1; i < rawData.length; i++) {
      var currentDayOfYear = moment(rawData[i].date, "MM/DD/YYYY").dayOfYear();
      var previousDayOfYear = moment(
        rawData[i - 1].date,
        "MM/DD/YYYY"
      ).dayOfYear();
      var deltaDay = currentDayOfYear - previousDayOfYear;
      var deltaDial = rawData[i].dial - rawData[i - 1].dial;
      var deltaIn = rawData[i].code14 - rawData[i - 1].code14;
      var deltaOut = rawData[i].code24 - rawData[i - 1].code24;
      var consumed = deltaIn - deltaOut + deltaDial;
      var averageDailyConsumption = consumed / deltaDay;

      seriesData.push({
        x: currentDayOfYear,
        y: averageDailyConsumption
      });
    }

    return seriesData;
  }

  makeCharts(dataProduced, dataConsumed) {
    Chart.defaults.global.elements.point.pointStyle = "triangle";
    new Chart("canvas", {
      responsive: true,
      type: "line",
      data: {
        datasets: [
          {
            label: "Produced",
            fill: false,
            data: dataProduced,
            backgroundColor: ["rgba(0,196,0,1)"],
            borderColor: ["rgba(0,196,0,1)"],
            borderWidth: 1
          },
          {
            label: "Consumed",
            fill: false,
            data: dataConsumed,
            backgroundColor: ["rgba(196,0,0,1)"],
            borderColor: ["rgba(196,0,0,1)"],
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
    this._dataService.get("data2019").subscribe(res => {
      var seriesProduced = this.makeProductionSeries(res);
      var seriesConsumed = this.makeConsumptionSeries(res);
      this.makeCharts(seriesProduced, seriesConsumed);
    });
  }
}
