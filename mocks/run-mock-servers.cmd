cd ../app/admin
call ng build
cd ../
copy "blog-widget.html" "./admin/dist/admin"
copy "solarchart.js" "./admin/dist/admin"
cd ../
start node ./mocks/api-server.js 
start node ./mocks/static-page-server.js
cd mocks