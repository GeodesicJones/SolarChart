function solarData(dataUrl2016, dataUrl2018) {
  var months = [
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
  var ctx = document.getElementById("myChart").getContext("2d");

  function makeSeries(rawDataJson) {
    var seriesData = [];
    for (var i = 1; i < rawDataJson.length; i++) {
      var currentDayOfYear = moment(
        rawDataJson[i].date,
        "MM/DD/YYYY"
      ).dayOfYear();
      var previousDayOfYear = moment(
        rawDataJson[i - 1].date,
        "MM/DD/YYYY"
      ).dayOfYear();
      var currentCumulativeProduction = rawDataJson[i].dial;
      var previousCumulativeProduction = rawDataJson[i - 1].dial;
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

  $.when($.getJSON(dataUrl2016), $.getJSON(dataUrl2018)).then(function(
    data2016,
    data2018
  ) {
    var series2016 = makeSeries(data2016[0]);
    var series2018 = makeSeries(data2018[0]);
    makeCharts(series2016, series2018);
  });

  function makeCharts(data2016, data2018) {
    Chart.defaults.global.elements.point.pointStyle = "triangle";
    new Chart(ctx, {
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
}
