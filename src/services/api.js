
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
