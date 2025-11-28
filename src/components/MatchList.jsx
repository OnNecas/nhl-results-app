import React, { useEffect, useState } from 'react';
import MatchCard from './MatchCard';

const MatchList = ({ fetchFunction, sortDescending = false }) => {
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSchedule = async () => {
            try {
                const data = await fetchFunction();
                setSchedule(data);
            } catch (err) {
                setError('Failed to load schedule');
            } finally {
                setLoading(false);
            }
        };

        loadSchedule();
    }, [fetchFunction]);

    if (loading) return <div className="loading">Loading scores...</div>;
    if (error) return <div className="error">{error}</div>;

    // Flatten all games from the week
    const allGames = schedule.gameWeek.flatMap(day => day.games);

    // Sort by start time
    allGames.sort((a, b) => new Date(a.startTimeUTC) - new Date(b.startTimeUTC));

    // Group by CET Date
    const groupedMap = allGames.reduce((acc, game) => {
        const date = new Date(game.startTimeUTC);
        const options = { timeZone: 'Europe/Prague', weekday: 'long', month: 'long', day: 'numeric' };
        const cetDateStr = new Intl.DateTimeFormat('en-US', options).format(date);

        // Create a sortable timestamp (midnight of that day) for the group
        const sortTimestamp = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Prague' })).setHours(0, 0, 0, 0);

        if (!acc[cetDateStr]) {
            acc[cetDateStr] = {
                dateStr: cetDateStr,
                timestamp: sortTimestamp,
                games: []
            };
        }
        acc[cetDateStr].games.push(game);
        return acc;
    }, {});

    // Convert map to array and sort
    const groupedArray = Object.values(groupedMap).sort((a, b) => {
        return sortDescending
            ? b.timestamp - a.timestamp
            : a.timestamp - b.timestamp;
    });

    return (
        <div className="match-list">
            {groupedArray.map(({ dateStr, games }) => (
                <div key={dateStr} className="game-day">
                    <h2 className="date-header">{dateStr}</h2>
                    <div className="games-grid">
                        {games.map((game) => <MatchCard key={game.id} game={game} />)}
                    </div>
                </div>
            ))}
            {groupedArray.length === 0 && (
                <p className="no-games">No games found</p>
            )}
        </div>
    );
};

export default MatchList;
