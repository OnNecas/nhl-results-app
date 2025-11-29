export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Fetch from NHL API - the /standings/now endpoint redirects to /standings/{date}
        // We'll fetch it and let the redirect happen
        const nhlApiUrl = 'https://api-web.nhle.com/v1/standings/now';

        const response = await fetch(nhlApiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
            redirect: 'follow', // Follow redirects
        });

        if (!response.ok) {
            throw new Error(`NHL API returned ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching standings:', error);
        res.status(500).json({ error: 'Failed to fetch standings' });
    }
}
