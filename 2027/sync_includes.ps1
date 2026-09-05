# Synchronizes navigation.html and announcement.html into js/include.js and all 2027 HTML files
$scriptDir = $PSScriptRoot
$nodeScript = Join-Path $scriptDir 'build_includes.js'
if (Test-Path $nodeScript) {
    node $nodeScript
} else {
    Write-Warning 'build_includes.js not found'
}