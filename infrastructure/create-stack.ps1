param(
    [Parameter(Mandatory = $true)][string]$domain = $(Read-Host "Domain Root (e.g. 'example' from 'example.com')"),
    [Parameter(Mandatory = $true)][string]$subdomain = $(Read-Host "Subdomain (e.g. 'sub' from 'sub.example.com')"),
    [Parameter(Mandatory = $true)][string]$blog = $(Read-Host "Subdomain of blog (e.g. 'myblog' from 'myblog.blogspot.com')")
)

$ErrorActionPreference = "Stop"

$stackName = $subdomain
$templateName = 'stack-template.yaml'
$deployBucket = "deploy-$subdomain.$domain.com"

$sourceUrl = "$subdomain.$domain.com"  # source from the perspective of the blog
$sourceBucket = $sourceUrl
$allowedOrigin = "$blog.blogger.com"  # origin permitted for CORS
$hostedZone = "$domain.com."  # period on end is required
$region = 'us-west-2'

####################################################
# Push stack template to deploy bucket and execute
####################################################

function StackExists($stackName) {
    $stacks = Get-CFNStack -Region $region
    foreach ($stack in $stacks) {
        if ($stack.StackName = $stackName) {
            return true;
        }
    }
    return false;
}

if (!(Test-S3Bucket  -BucketName $deployBucket)) {
    New-S3Bucket -BucketName $deployBucket -Region $region
}

Write-S3Object -BucketName $deployBucket `
    -Key $templateName `
    -File $templateName `
    -Region $region

if (!(StackExists $stackName)) {
    New-CFNStack `
        -StackName $stackName `
        -Region $region `
        -TemplateURL "https://s3.amazonaws.com/$deployBucket/$templateName" `
        -Capability CAPABILITY_IAM `
        -Parameters @( `
        @{ ParameterKey = 'SourceUrl'; ParameterValue = $sourceUrl}, `
        @{ ParameterKey = 'AllowedOrigin'; ParameterValue = $allowedOrigin}, `
        @{ ParameterKey = 'HostedZone'; ParameterValue = $hostedZone}
    ) 
    Write-Output('Waiting for create...')
    Wait-CFNStack -StackName $stackName -Status CREATE_COMPLETE -Region $region -Timeout 7200
    Write-Output('Create Complete')
}

####################################################
# Push app files to bucket for static website
####################################################

function PushAppFile([string]$path, [string]$name) {
    Write-S3Object -BucketName $sourceBucket `
        -Key $name `
        -File "$path/$name" `
        -Region $region
}

Write-Host 'Pushing files...'

PushAppFile '../app' 'blog-widget.html'
PushAppFile '../app' 'solarchart.js'
PushAppFile '../data' 'data2016.json'
PushAppFile '../data' 'data2018.json'

Write-Host 'Invalidating distro...'

$distroId = 0
$distros = Get-CFDistributionList -Region $region
foreach ($distro in $distros) {
    if ($distro.Aliases[0].Items = $sourceUrl) {
        $distroId = $distro.Id
    }
}

New-CFInvalidation -DistributionId $distroId -Region $region `
    -InvalidationBatch_CallerReference (get-date).ticks `
    -Paths_Item '/*' `
    -Paths_Quantity 1