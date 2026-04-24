Get-ChildItem -Path "." -Filter "*.html" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'assets/css/style\.css"', 'assets/css/style.css?v=2"'
    Set-Content $_.FullName $content
    Write-Host "Updated: $($_.Name)"
}
