# Generates public/og.png (1200x630) for OpenGraph / Twitter card.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/generate-og.ps1
Add-Type -AssemblyName System.Drawing

$W = 1200
$H = 630
$out = Join-Path $PSScriptRoot '..\public\og.png'
$outDir = Split-Path $out
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }

$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'
$g.Clear([System.Drawing.Color]::FromArgb(10, 10, 12))

# Background gradient (deep indigo -> near black)
$bgRect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
  $bgRect,
  [System.Drawing.Color]::FromArgb(38, 38, 92),
  [System.Drawing.Color]::FromArgb(10, 10, 12),
  135)
$g.FillRectangle($bgBrush, $bgRect)

# Accent bar on the left edge
$barBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(165, 180, 252))
$g.FillRectangle($barBrush, 0, 0, 18, $H)

# Glow circle (top right) for depth
$glowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(70, 99, 102, 241))
$g.FillEllipse($glowBrush, 800, -240, 700, 700)

# Brand mark (squares)
$sw = 46
$g.FillRectangle([System.Drawing.Brushes]::White, 90, 150, $sw, $sw)
$g.FillRectangle($barBrush, 148, 150, $sw, $sw)

# Fonts
$h = New-Object System.Drawing.Font 'Segoe UI', 40, ([System.Drawing.FontStyle]::Bold)
$sub = New-Object System.Drawing.Font 'Segoe UI', 26, ([System.Drawing.FontStyle]::Regular)
$small = New-Object System.Drawing.Font 'Segoe UI', 20, ([System.Drawing.FontStyle]::Regular)
$white = [System.Drawing.Brushes]::White
$soft = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 200, 210))

$g.DrawString('College Management System', $small, $soft, 190, 96)
$g.DrawString('PVKN Govt College (A) Chittoor', $h, $white, 190, 150)
$g.DrawString('Department of Computer Applications', $sub, $barBrush, 190, 230)
$g.DrawString('Attendance · Marks · Results · Placements · Notices', $small, $soft, 190, 360)

# Footer line
$footY = 540
$g.DrawLine($soft, 190, $footY, 1010, $footY)
$g.DrawString('Official college portal - B.Com & Computer Applications', $small, $soft, 190, 556)

$g.Dispose()
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Generated $out ($((Get-Item $out).Length) bytes)"