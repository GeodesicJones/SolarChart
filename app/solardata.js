function solarData(dataUrl2016,dataUrl2018) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var ctx = document.getElementById("myChart").getContext('2d');

    // var dataUrl2016 = "http://solar.geodesicjones.com/data2016.csv";
    // var dataUrl2018 = "http://solar.geodesicjones.com/data2018.csv";

    function makeSeries(rawCSV) {
        var seriesData = [];
        var lines = rawCSV.split('\n');
        for (var i = 2; i < lines.length; i++) {
            var currentLine = lines[i].split(',');
            var previousLine = lines[i - 1].split(',');
            var currentDayOfYear = moment(currentLine[0], "MM/DD/YYYY").dayOfYear();
            var previousDayOfYear = moment(previousLine[0], "MM/DD/YYYY").dayOfYear();
            var currentCumulativeProduction = currentLine[1];
            var previousCumulativeProduction = previousLine[1];
            var averageDailyProduction = (currentCumulativeProduction - previousCumulativeProduction) / (currentDayOfYear - previousDayOfYear);

            seriesData.push({
                x: currentDayOfYear,
                y: averageDailyProduction
            });
        }

        return seriesData;
    }

    $.when($.ajax(dataUrl2016), $.ajax(dataUrl2018))
        .then(function (data2016, data2018) {
            var series2016 = makeSeries(data2016[0]);
            var series2018 = makeSeries(data2018[0]);
            makeCharts(series2016, series2018);
        });

    function makeCharts(data2016, data2018) {
        Chart.defaults.global.elements.point.pointStyle = 'triangle';
        new Chart(ctx, {
            responsive: true,
            type: 'line',
            data: {
                datasets: [
                    {
                        label: '2018',
                        fill: false,
                        data: data2018,
                        backgroundColor: [
                            'rgba(79,129,189,1)'
                        ],
                        borderColor: [
                            'rgba(79,129,189,1)'
                        ],
                        borderWidth: 1
                    },
                    {
                        label: '2016',
                        fill: false,
                        data: data2016,
                        backgroundColor: [
                            'rgba(155,187,89,1)'
                        ],
                        borderColor: [
                            'rgba(155,187,89,1)'
                        ],
                        borderWidth: 1
                    }]
            },
            options: {
                tooltips: {
                    callbacks: {
                        // title: function(tooltipItem, data) {
                        //   return data['labels'][tooltipItem[0]['index']];
                        // },
                        // label: function(tooltipItem, data) {
                        //   return data['datasets'][0]['data'][tooltipItem['index']];
                        // },
                        // afterLabel: function(tooltipItem, data) {
                        //   var dataset = data['datasets'][0];
                        //   var percent = Math.round((dataset['data'][tooltipItem['index']] / dataset["_meta"][0]['total']) * 100)
                        //   return '(' + percent + '%)';
                        // }
                    },
                    // cornerRadius: 0,
                    // caretSize: 0,
                    // xPadding: 16,
                    // yPadding: 10,
                    // backgroundColor: 'rgba(0, 150, 100, 0.9)',
                    // titleFontStyle: 'normal',
                    // titleMarginBottom: 15
                },
                responsive: true,
                title: {
                    display: true,
                    text: 'average kwh/day, by week'
                },
                legend: {
                    position: 'right'
                },
                scales: {
                    xAxes: [{
                        type: 'linear',
                        display: true,
                        position: 'bottom',
                        ticks: {
                            callback: function (value, index, values) {
                                var date = moment().dayOfYear(value);
                                if (date.date() == 1) {
                                    return months[date.month()];
                                }
                                return null;
                            },
                            beginAtZero: true,
                            autoSkip: false,
                            stepSize: 1,
                        }
                    }],
                    yAxes: [{
                        display: true,
                        ticks: {
                            min: 0,
                            max: 16,
                            stepSize: 2
                        }
                    }]
                }
            }
        });
    }
}