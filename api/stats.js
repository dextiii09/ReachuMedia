const fs = require('fs');
const path = require('path');
const https = require('https');

export default async function handler(req, res) {
  try {
    let htmlContent = '';
    const portfolioPath = path.join(process.cwd(), 'portfolio.html');
    
    // Attempt to read from local filesystem first (works in dev and most Vercel environments)
    if (fs.existsSync(portfolioPath)) {
      htmlContent = fs.readFileSync(portfolioPath, 'utf8');
    } else {
      // Fallback: Fetch from the live production site if the file isn't bundled in the serverless function
      htmlContent = await new Promise((resolve, reject) => {
        https.get('https://Reachupmedia.in/portfolio', (resp) => {
          let data = '';
          resp.on('data', (chunk) => { data += chunk; });
          resp.on('end', () => { resolve(data); });
        }).on("error", (err) => { reject(err); });
      });
    }

    // Parse the HTML content to find the number of "Live" and "Case Study" badges
    // Assuming the Live badge is: <span class="badge badge-live">Live</span>
    const liveMatches = htmlContent.match(/class="[^"]*badge-live[^"]*"\s*>Live<\/span>/gi) || [];
    const liveCount = liveMatches.length;

    // Assuming Case Study badge is: >Case Study</span> or >Brand Case Study</span>
    const caseStudyMatches = htmlContent.match(/>(?:Brand\s+)?Case\s+Study<\/span>/gi) || [];
    const completedCount = caseStudyMatches.length;

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // cache for 1 minute
    res.status(200).json({
      success: true,
      data: {
        liveCount,
        completedCount,
        totalCampaigns: liveCount + completedCount
      }
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch campaign stats' });
  }
}
