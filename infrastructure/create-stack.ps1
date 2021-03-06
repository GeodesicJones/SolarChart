param(
    [Parameter(Mandatory = $true)][string]$domain = $(Read-Host "Domain Root (e.g. 'example' from 'example.com')"),
    [Parameter(Mandatory = $true)][string]$subdomain = $(Read-Host "Subdomain (e.g. 'sub' from 'sub.example.com')"),
    [Parameter(Mandatory = $true)][string]$blog = $(Read-Host "Subdomain of blog (e.g. 'myblog' from 'myblog.blogspot.com')")
)

$ErrorActionPreference = "Stop"

$stackName = $subdomain
$templateName = 'stack-template.yaml'
$deployBucket = "deploy-$subdomain.$domain.com"

$appSubDomain = "$subdomain.$domain.com" 
$appBucket = "app-$appSubDomain"
$dataBucket = "data-$appSubDomain"
$allowedOrigin = "$blog.blogger.com"  # origin permitted for CORS
$hostedZone = "$domain.com."  # period on end is required
$region = 'us-west-2'
$zipName = 'index.zip'

if (!(Test-S3Bucket  -BucketName $deployBucket)) {
    New-S3Bucket -BucketName $deployBucket -Region $region
}

####################################################
# Zip dependencies and push to deploy bucket
####################################################

$zipPath = "temp/$zipName"
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath
}
Compress-Archive -LiteralPath ../server/bin, ../server/jwt, ../server/index.py -DestinationPath $zipPath
Write-S3Object -BucketName $deployBucket `
    -Key $zipName `
    -File $zipPath `
    -Region $region

####################################################
# Push stack template to deploy bucket and execute
####################################################

function StackExists($stackName) {
    $stacks = Get-CFNStack -Region $region
    foreach ($stack in $stacks) {
        if ($stack.StackName -eq $stackName) {
            return $true;
        }
    }
    return $false;
}

Write-S3Object -BucketName $deployBucket `
    -Key $templateName `
    -File $templateName `
    -Region $region

if ((StackExists $stackName) -eq $false) {
    New-CFNStack `
        -StackName $stackName `
        -Region $region `
        -TemplateURL "https://s3.amazonaws.com/$deployBucket/$templateName" `
        -Capability CAPABILITY_IAM `
        -Parameters @( `
        @{ ParameterKey = 'AppSubDomain'; ParameterValue = $appSubDomain}, `
        @{ ParameterKey = 'AllowedOrigin'; ParameterValue = $allowedOrigin}, `
        @{ ParameterKey = 'HostedZone'; ParameterValue = $hostedZone}
    ) 
    Write-Output('Waiting for create...')
    Wait-CFNStack -StackName $stackName -Status CREATE_COMPLETE -Region $region -Timeout 7200
    Write-Output('Create Complete')
}
else {
    Update-CFNStack `
        -StackName $stackName `
        -Region $region `
        -TemplateURL "https://s3.amazonaws.com/$deployBucket/$templateName" `
        -Capability CAPABILITY_IAM `
        -Parameters @( `
        @{ ParameterKey = 'AppSubDomain'; ParameterValue = $appSubDomain}, `
        @{ ParameterKey = 'AllowedOrigin'; ParameterValue = $allowedOrigin}, `
        @{ ParameterKey = 'HostedZone'; ParameterValue = $hostedZone}
    ) 
    Write-Output('Waiting for update...')
    Wait-CFNStack -StackName $stackName -Status UPDATE_COMPLETE -Region $region -Timeout 7200
    Write-Output('Update Complete')
}

function UploadFile([string]$path, [string]$name, [string]$bucket) {
    Write-S3Object -BucketName $bucket `
        -Key $name `
        -File "$path/$name" `
        -Region $region
}

# Fix api paths in widget
if (!(Test-Path "./temp")) {
    New-Item -Path "." -Name "temp" -ItemType "directory"
}
Copy-Item "../app/blog-widget.html" -Destination "./temp"
$widgetContent = Get-Content -path './temp/blog-widget.html'  -Raw
$widgetContent = $widgetContent.Replace("http://localhost:3000/?key=data2019.json", "https://api-$appSubdomain/?key=data2019.json")
Set-Content -Path './temp/blog-widget.html' -Value $widgetContent

Write-Host 'Pushing files...'

UploadFile './temp' 'blog-widget.html' $appBucket
UploadFile '../app' 'solarchart.js' $appBucket
UploadFile '../data' 'data2019.json' $dataBucket

Write-S3Object -BucketName $appBucket `
    -Folder "../app/admin/dist/admin" `
    -KeyPrefix "/" `
    -Region $region

Write-Host 'Invalidating distro...'

$distroId = 0
$distros = Get-CFDistributionList -Region $region
foreach ($distro in $distros) {
    if ($distro.Aliases[0].Items = $appSubDomain) {
        $distroId = $distro.Id
    }
}

New-CFInvalidation -DistributionId $distroId -Region $region `
    -InvalidationBatch_CallerReference (get-date).ticks `
    -Paths_Item '/*' `
    -Paths_Quantity 1