$content = Get-Content -Raw "index.html"
$find = '(?s)<span class="badge badge-accent"\s*>Influencer Marketing • Artist Management</span\s*>'
$replace = '<div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px;">
            <span class="badge badge-accent" style="margin-bottom: 0;">Influencer Marketing • Artist Management</span>
            <a href="./portfolio.html" class="pill-live">
              <span class="live-dot"></span>
              2 Campaigns <span class="text-red">Live Now</span>
            </a>
          </div>'
$content = $content -replace $find, $replace
$find2 = '(?s)<!-- Fixed Right-Side Live Campaign Widget -->.*2 Campaigns Live\s*</a>'
$content = $content -replace $find2, ''
Set-Content "index.html" $content
