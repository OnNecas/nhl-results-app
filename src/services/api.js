
export const fetchSchedule = async (date) => {
    try {
        const targetDate = date || new Date().toISOString().split('T')[0];

        // Use Vercel serverless function in production, Vite proxy in development
        const isDevelopment = import.meta.env.DEV;
        const apiUrl = isDevelopment
            ? `/api-nhl/v1/schedule/${targetDate}`
            : `/api/schedule?date=${targetDate}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch schedule');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching schedule:', error);
        throw error;
    }
};

export const fetchUpcomingSchedule = () => {
    const today = new Date().toISOString().split('T')[0];
    return fetchSchedule(today);
};

export const fetchRecentResults = async () => {
    try {
        // Fetch schedule starting 7 days ago to ensure we find recent games
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 7);
        const dateStr = pastDate.toISOString().split('T')[0];

        const data = await fetchSchedule(dateStr);

        const today = new Date().toISOString().split('T')[0];

        // Filter out games that are in the future (though 'pastDate' request usually returns past week)
        const pastDays = data.gameWeek.filter(day => day.date < today);

        return {
            ...data,
            gameWeek: pastDays
        };

    } catch (error) {
        console.error('Error fetching recent results:', error);
        throw error;
    }
};

export const fetchGameLanding = async (gameId) => {
    try {
        // Use Vercel serverless function in production, Vite proxy in development
        const isDevelopment = import.meta.env.DEV;
        const apiUrl = isDevelopment
            ? `/api-nhl/v1/gamecenter/${gameId}/landing`
            : `/api/game?id=${gameId}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch game data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching game landing:', error);
        throw error;
    }
};

export const fetchStandings = async () => {
    try {
        // Use Vercel serverless function in production, Vite proxy in development
        const isDevelopment = import.meta.env.DEV;
        const apiUrl = isDevelopment
            ? '/api-nhl/v1/standings/now'
            : '/api/standings';

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch standings');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching standings:', error);
        throw error;
    }
};

export const fetchPlayerStats = async () => {
    try {
        // Use Vercel serverless function in production, Vite proxy in development
        const isDevelopment = import.meta.env.DEV;

        // Query params for top 200 players by points (same as in api/stats.js)
        const queryParams = '?isAggregate=false&isGame=false&sort=%5B%7B%22property%22:%22points%22,%22direction%22:%22DESC%22%7D%5D&start=0&limit=200&factCayenneExp=gamesPlayed%3E=1&cayenneExp=gameTypeId=2%20and%20seasonId%3C=20242025%20and%20seasonId%3E=20242025';

        const apiUrl = isDevelopment
            ? `/api-nhl/stats/rest/en/skater/summary${queryParams}`
            : '/api/stats';

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch player stats');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching player stats:', error);
        throw error;
    }
};
