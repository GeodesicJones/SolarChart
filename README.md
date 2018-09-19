# SolarChart
For a couple of years Charlyn has published weekly production data for our solar panels on her blog.

Generating the chart used tools we already had:  Excel to turn the raw data into a chart, CTRL+PrtScn to capture it, Paint to crop and save to JPG, then upload to the blog.  It worked, but was a bit cumbersome.

So I thought, why not automate it?  Just enter the data each week, and the chart magically appears online.

The chart is generated using ChartJS, with the script and the data files housed in AWS S3.  The source for the app itself is in the 'app' folder; the 'infrastructure' folder contains the files needed to set things up on AWS.
