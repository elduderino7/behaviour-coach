# Generates the PNG app icons in public/icons (same design as favicon.svg).
# Run with: npm run icons
Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot '..\public\icons'
New-Item -ItemType Directory -Force $out | Out-Null

function New-Icon([int]$size, [string]$name) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $s = $size / 64.0
  $green = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(47, 111, 98))
  $cream = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(251, 248, 243))
  $sand  = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(242, 200, 143))
  # Full-bleed background so the icon also works as a maskable icon.
  $g.FillRectangle($green, 0, 0, $size, $size)
  $g.FillEllipse($cream, 17 * $s, 18 * $s, 14 * $s, 14 * $s)
  $g.FillEllipse($sand, 37 * $s, 25 * $s, 10 * $s, 10 * $s)
  $g.FillPie($cream, 12 * $s, 37 * $s, 24 * $s, 30 * $s, 180, 180)
  $g.FillPie($sand, 33 * $s, 41 * $s, 18 * $s, 22 * $s, 180, 180)
  $bmp.Save((Join-Path $out $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

New-Icon 192 'icon-192.png'
New-Icon 512 'icon-512.png'
New-Icon 180 'apple-touch-icon.png'
