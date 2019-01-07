cd ../app/admin
call ng build --prod=true
cd ../../infrastructure
Powershell.exe -executionpolicy remotesigned -command  ".\create-stack.ps1 -domain geodesicjones -subdomain solarchart2019 -blog 21ststreeturbanhomestead"