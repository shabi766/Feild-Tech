#!/usr/bin/env pwsh
# Automated color replacement script for UI/UX redesign
# This script replaces purple/indigo colors with new design system colors

Write-Host "Starting automated color replacement..." -ForegroundColor Cyan

$frontendPath = "d:\Full Stack development\Feild-Tech\Frontend\src\components"

# Define replacement patterns
$replacements = @(
    # Purple gradients to accent gradients
    @{
        Pattern = 'bg-gradient-to-r from-blue-600 to-purple-600'
        Replacement = 'gradient-accent'
    },
    @{
        Pattern = 'bg-gradient-to-br from-blue-600 to-purple-600'
        Replacement = 'gradient-accent'
    },
    @{
        Pattern = 'bg-gradient-to-r from-blue-500 to-purple-600'
        Replacement = 'gradient-ocean'
    },
    @{
        Pattern = 'bg-gradient-to-br from-purple-500 to-pink-500'
        Replacement = 'gradient-accent'
    },
    @{
        Pattern = 'from-purple-600 to-violet-700'
        Replacement = 'from-primary-dark to-primary-darker'
    },
    @{
        Pattern = 'from-purple-500 to-violet-600'
        Replacement = 'from-primary to-primary-dark'
    },
    
    # Indigo gradients to primary gradients
    @{
        Pattern = 'from-indigo-500 to-purple-600'
        Replacement = 'gradient-accent'
    },
    @{
        Pattern = 'from-indigo-50 to-purple-50'
        Replacement = 'from-accent/10 to-accent-light/10'
    },
    @{
        Pattern = 'from-blue-100 to-purple-100'
        Replacement = 'from-primary/20 to-accent/20'
    },
    @{
        Pattern = 'from-blue-50 to-purple-50'
        Replacement = 'from-primary/10 to-accent/10'
    },
    
    # Purple solid colors to accent/primary
    @{
        Pattern = 'bg-purple-600'
        Replacement = 'bg-accent'
    },
    @{
        Pattern = 'bg-purple-500'
        Replacement = 'bg-accent'
    },
    @{
        Pattern = 'bg-purple-50'
        Replacement = 'bg-accent/10'
    },
    @{
        Pattern = 'bg-purple-100'
        Replacement = 'bg-accent/20'
    },
    @{
        Pattern = 'text-purple-600'
        Replacement = 'text-accent'
    },
    @{
        Pattern = 'text-purple-500'
        Replacement = 'text-accent'
    },
    @{
        Pattern = 'text-purple-900'
        Replacement = 'text-accent-dark'
    },
    @{
        Pattern = 'text-purple-700'
        Replacement = 'text-accent-dark'
    },
    @{
        Pattern = 'border-purple-200'
        Replacement = 'border-accent/30'
    },
    @{
        Pattern = 'border-purple-300'
        Replacement = 'border-accent/40'
    },
    @{
        Pattern = 'hover:bg-purple-700'
        Replacement = 'hover:bg-accent/90'
    },
    @{
        Pattern = 'hover:bg-purple-100'
        Replacement = 'hover:bg-accent/20'
    },
    
    # Indigo solid colors to primary
    @{
        Pattern = 'bg-indigo-600'
        Replacement = 'bg-primary'
    },
    @{
        Pattern = 'bg-indigo-500'
        Replacement = 'bg-primary'
    },
    @{
        Pattern = 'bg-indigo-100'
        Replacement = 'bg-primary/20'
    },
    @{
        Pattern = 'bg-indigo-50'
        Replacement = 'bg-primary/10'
    },
    @{
        Pattern = 'text-indigo-600'
        Replacement = 'text-primary'
    },
    @{
        Pattern = 'text-indigo-800'
        Replacement = 'text-primary-dark'
    },
    @{
        Pattern = 'border-indigo-500'
        Replacement = 'border-primary'
    },
    @{
        Pattern = 'border-indigo-200'
        Replacement = 'border-primary/30'
    },
    @{
        Pattern = 'border-indigo-100'
        Replacement = 'border-primary/20'
    },
    @{
        Pattern = 'hover:bg-indigo-700'
        Replacement = 'hover:bg-primary/90'
    },
    @{
        Pattern = 'hover:bg-indigo-600'
        Replacement = 'hover:bg-primary/90'
    },
    @{
        Pattern = 'hover:bg-indigo-100'
        Replacement = 'hover:bg-primary/20'
    },
    @{
        Pattern = 'hover:bg-indigo-50'
        Replacement = 'hover:bg-primary/10'
    },
    @{
        Pattern = 'focus:border-indigo-500'
        Replacement = 'focus:border-primary'
    },
    @{
        Pattern = 'focus:ring-indigo-500'
        Replacement = 'focus:ring-primary'
    },
    @{
        Pattern = 'hover:text-indigo-800'
        Replacement = 'hover:text-primary-dark'
    },
    @{
        Pattern = 'text-indigo-500'
        Replacement = 'text-primary'
    }
)

# Get all JSX files
$files = Get-ChildItem -Path $frontendPath -Filter "*.jsx" -Recurse

$totalFiles = $files.Count
$modifiedFiles = 0
$currentFile = 0

foreach ($file in $files) {
    $currentFile++
    Write-Progress -Activity "Processing files" -Status "File $currentFile of $totalFiles" -PercentComplete (($currentFile / $totalFiles) * 100)
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileModified = $false
    
    foreach ($replacement in $replacements) {
        if ($content -match [regex]::Escape($replacement.Pattern)) {
            $content = $content -replace [regex]::Escape($replacement.Pattern), $replacement.Replacement
            $fileModified = $true
        }
    }
    
    if ($fileModified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $modifiedFiles++
        Write-Host "✓ Modified: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nColor replacement complete!" -ForegroundColor Cyan
Write-Host "Total files processed: $totalFiles" -ForegroundColor Yellow
Write-Host "Files modified: $modifiedFiles" -ForegroundColor Green
