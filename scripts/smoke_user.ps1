param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot "backend"
$frontendPath = Join-Path $repoRoot "frontend"

Write-Host "[smoke_user] Running backend patient self-service tests..."
Push-Location $backendPath
try {
  & ".\venv\Scripts\python.exe" -m pytest -q tests/test_user_self_service_api.py
  if ($LASTEXITCODE -ne 0) {
    throw "Backend smoke tests failed."
  }
}
finally {
  Pop-Location
}

Write-Host "[smoke_user] Running frontend tests..."
Push-Location $frontendPath
try {
  npm run test -- --run
  if ($LASTEXITCODE -ne 0) {
    throw "Frontend tests failed."
  }

  if (-not $SkipBuild) {
    Write-Host "[smoke_user] Building frontend..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
      throw "Frontend build failed."
    }
  }
}
finally {
  Pop-Location
}

Write-Host "[smoke_user] User-flow smoke checks passed."
