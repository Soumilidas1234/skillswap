# Adds portable Node.js and PHP to PATH when system installs are missing.
$toolsDir = Join-Path $env:LOCALAPPDATA "skillswap-tools"
$nodeDir = Join-Path $toolsDir "node"
$phpDir = Join-Path $toolsDir "php"
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.0\bin"

foreach ($dir in @($nodeDir, $phpDir, $mysqlBin, "C:\Program Files\MySQL\MySQL Server 8.4\bin")) {
    if ((Test-Path $dir) -and ($env:PATH -notlike "*$dir*")) {
        $env:PATH = "$dir;$env:PATH"
    }
}

# Ensure PHP extensions load from the portable install
$phpIni = Join-Path $phpDir "php.ini"
if ((Test-Path $phpIni) -and -not (Select-String -Path $phpIni -Pattern "^extension_dir = `"$([regex]::Escape($phpDir))\\ext`"" -Quiet)) {
    $content = Get-Content $phpIni -Raw
    $content = $content -replace ';extension_dir = "ext"', "extension_dir = `"$phpDir\ext`""
    foreach ($ext in @('curl', 'fileinfo', 'mbstring', 'openssl', 'pdo_mysql', 'zip')) {
        $content = $content -replace ";extension=$ext", "extension=$ext"
    }
    Set-Content $phpIni $content -NoNewline
}
