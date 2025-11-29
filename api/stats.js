export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Determine current NHL season dynamically
        // NHL season starts in October, so if we're before October, use previous year
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed, so October = 9

        // If before October, season is (year-1)(year), otherwise it's (year)(year+1)
        const seasonStartYear = currentMonth < 9 ? currentYear - 1 : currentYear;
        const seasonEndYear = seasonStartYear + 1;
        const seasonId = `${seasonStartYear}${seasonEndYear}`;

        // Fetch skater stats summary
        // We fetch top 200 players by points to have a good dataset for PCA
        const nhlApiUrl = `https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=%5B%7B%22property%22:%22points%22,%22direction%22:%22DESC%22%7D%5D&start=0&limit=200&factCayenneExp=gamesPlayed%3E=1&cayenneExp=gameTypeId=2%20and%20seasonId%3C=${seasonId}%20and%20seasonId%3E=${seasonId}`;

        const response = await fetch(nhlApiUrl);

        if (!response.ok) {
            throw new Error(`NHL API returned ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({ error: 'Failed to fetch player stats' });
    }
}
