# Simple HTTP Server
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8000/')
$listener.Start()

# 获取当前脚本所在目录的父目录
$rootDir = Split-Path -Parent $PSScriptRoot
$clientDir = Join-Path -Path $rootDir -ChildPath 'client'

Write-Host "Server started at http://localhost:8000"
Write-Host "Press Ctrl+C to stop server"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    # Determine file path
    $filePath = Join-Path -Path $clientDir -ChildPath ($request.Url.LocalPath.TrimStart('/'))
    
    # Return index.html for root path
    if ([string]::IsNullOrEmpty($request.Url.LocalPath) -or $request.Url.LocalPath -eq '/') {
        $filePath = Join-Path -Path $clientDir -ChildPath 'index.html'
    }
    
    # Check if file exists
    if (Test-Path $filePath -PathType Leaf) {
        # Read file content
        $content = Get-Content -Path $filePath -Raw
        
        # Set content length
        $response.ContentLength64 = [System.Text.Encoding]::UTF8.GetByteCount($content)
        
        # Write response
        $response.OutputStream.Write([System.Text.Encoding]::UTF8.GetBytes($content), 0, [System.Text.Encoding]::UTF8.GetByteCount($content))
    } else {
        # File not found
        $response.StatusCode = 404
    }
    
    # Close response
    $response.Close()
}