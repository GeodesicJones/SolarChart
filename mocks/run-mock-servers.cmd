cd ../app/admin
call ng build
cd ../../mocks
start node api-server.js
start node static-page-server.js