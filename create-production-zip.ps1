# PowerShell script to create production ZIP without node_modules
# Run this script from the MODULE_2 directory

$ErrorActionPreference = "Stop"

Write-Host "Creating production ZIP..." -ForegroundColor Green

# Define paths
$sourceDir = "."
$tempDir = ".\temp_production"
$zipFile = "D-HOMS-Production.zip"

# Clean up temp directory if exists
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
    Write-Host "Cleaned up temp directory" -ForegroundColor Yellow
}

# Create temp directory
New-Item -ItemType Directory -Path $tempDir | Out-Null
Write-Host "Created temp directory" -ForegroundColor Green

# Copy backend (exclude node_modules)
Write-Host "Copying backend files..." -ForegroundColor Green
$backendDest = "$tempDir\backend"
New-Item -ItemType Directory -Path $backendDest | Out-Null
Get-ChildItem -Path ".\backend" -Exclude "node_modules", ".env", "*.log" | Copy-Item -Destination $backendDest -Recurse

# Copy frontend (exclude node_modules and build)
Write-Host "Copying frontend files..." -ForegroundColor Green
$frontendDest = "$tempDir\frontend"
New-Item -ItemType Directory -Path $frontendDest | Out-Null
Get-ChildItem -Path ".\frontend" -Exclude "node_modules", "build", ".env.local", ".env.development" | Copy-Item -Destination $frontendDest -Recurse

# Copy database files
Write-Host "Copying database files..." -ForegroundColor Green
Copy-Item -Path ".\database" -Destination $tempDir -Recurse

# Copy root files
Write-Host "Copying root files..." -ForegroundColor Green
Copy-Item -Path ".\package.json" -Destination $tempDir
Copy-Item -Path ".\README_DEPLOYMENT.md" -Destination $tempDir

# Create ZIP
Write-Host "Creating ZIP file..." -ForegroundColor Green
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Clean up temp directory
Remove-Item $tempDir -Recurse -Force
Write-Host "Cleaned up temp directory" -ForegroundColor Yellow

Write-Host "Production ZIP created: $zipFile" -ForegroundColor Green
Write-Host "File size: $((Get-Item $zipFile).Length / 1MB) MB" -ForegroundColor Green
