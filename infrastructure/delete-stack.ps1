param(
    [Parameter(Mandatory = $true)][string]$domain = $(Read-Host "Domain Root (e.g. 'example' from 'example.com')"),
    [Parameter(Mandatory = $true)][string]$subdomain = $(Read-Host "Subdomain (e.g. 'sub' from 'sub.example.com')")
)

$region = 'us-west-2'
$stackName = $subdomain
$appBucket = "app-$subdomain.$domain.com"
$dataBucket = "data-$subdomain.$domain.com"

# 'cause when you delete the stack, all buckets must be empty or stack delete will fail.
function EmptyBucket($bucketName) {
    Write-Output('Deleting bucket contents...')
    $bucketContents = Get-S3Object -BucketName $bucketName -Region $region
    foreach ( $obj in $bucketContents ) {
        Remove-S3Object -BucketName $bucketName -Key $obj.Key -Region $region
    }
}

EmptyBucket $appBucket
EmptyBucket $dataBucket

Remove-CFNStack -StackName $stackName -Region $region
Write-Output('Waiting for stack delete...')
Wait-CFNStack -StackName $stackName -Status DELETE_COMPLETE -Region $region -Timeout 7200
Write-Output('Stack deleted')
