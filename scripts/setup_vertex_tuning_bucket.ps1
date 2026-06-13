param(
  [string]$ProjectId = 'copy-writing-499306',
  [string]$Location = 'us-central1',
  [string]$Bucket = 'copy-writing-499306-vertex-tuning',
  [string]$VertexMossFtServiceAccount = 'service-167488791850@gcp-sa-vertex-moss-ft.iam.gserviceaccount.com'
)

$ErrorActionPreference = 'Stop'

$bucketUri = 'gs://' + $Bucket
$member = 'serviceAccount:' + $VertexMossFtServiceAccount

Write-Host ('Using project: ' + $ProjectId)
& gcloud config set project $ProjectId
if ($LASTEXITCODE -ne 0) { throw 'gcloud config set project failed' }

Write-Host ('Checking bucket: ' + $bucketUri)
$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
& gcloud storage buckets describe $bucketUri --project $ProjectId *> $null
$describeExitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference

if ($describeExitCode -ne 0) {
  Write-Host ('Creating bucket: ' + $bucketUri + ' in ' + $Location)
  & gcloud storage buckets create $bucketUri --project $ProjectId --location $Location --uniform-bucket-level-access
  if ($LASTEXITCODE -ne 0) { throw 'bucket create failed' }
} else {
  Write-Host ('Bucket already exists: ' + $bucketUri)
}

Write-Host ('Granting object permissions to ' + $VertexMossFtServiceAccount)
& gcloud storage buckets add-iam-policy-binding $bucketUri --member $member --role roles/storage.objectAdmin
if ($LASTEXITCODE -ne 0) { throw 'grant storage.objectAdmin failed' }

Write-Host ('Granting bucket metadata permission to ' + $VertexMossFtServiceAccount)
& gcloud storage buckets add-iam-policy-binding $bucketUri --member $member --role roles/storage.legacyBucketReader
if ($LASTEXITCODE -ne 0) { throw 'grant storage.legacyBucketReader failed' }

Write-Host ('Done. Set backend/.env: VERTEX_TUNING_BUCKET=' + $Bucket)
