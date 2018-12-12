param(
    [Parameter(Mandatory = $true)][string]$domain = $(Read-Host "Domain Root (e.g. 'example' from 'example.com')"),
    [Parameter(Mandatory = $true)][string]$subdomain = $(Read-Host "Subdomain (e.g. 'sub' from 'sub.example.com')")
)

$region = 'us-west-2'
$stackName = $subdomain
$sourceBucket = "$subdomain.$domain.com"

Write-Output('Deleting bucket contents...')
$bucketContents = Get-S3Object -BucketName $sourceBucket -Region $region
foreach ( $obj in $bucketContents ) {
    Remove-S3Object -BucketName $sourceBucket -Key $obj.Key -Region $region
}
Write-Output('Deleting bucket...')
Remove-S3Bucket -BucketName $sourceBucket -Region $region

Remove-CFNStack -StackName $stackName -Region $region
Write-Output('Waiting for stack delete...')
Wait-CFNStack -StackName $stackName -Status DELETE_COMPLETE -Region $region -Timeout 7200
Write-Output('Stack deleted')
