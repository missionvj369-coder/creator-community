$content = Get-Content 'd:\ninty nine\package.json'
$content = $content -replace '"type": "module",', ''
Set-Content 'd:\ninty nine\package.json' $content