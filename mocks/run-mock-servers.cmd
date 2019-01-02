cd ../app/admin
call ng build
cd ../../
start node ./mocks/api-server.js 
start node ./mocks/static-page-server.js
cd mocks