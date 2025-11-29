import React, { useEffect, useState } from 'react';
import { fetchStandings } from '../services/api';

const StandingsPage = () => {
    const [standings, setStandings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('division'); // 'division' or 'conference'

    useEffect(() => {
        const loadStandings = async () => {
            try {
                const data = await fetchStandings();
                setStandings(data.standings);
            } catch (err) {
                setError('Failed to load standings');
            } finally {
                setLoading(false);
            }
        };
        loadStandings();
    }, []);

    if (loading) return <div className="loading">Loading standings...</div>;
    if (error) return <div className="error">{error}</div>;

    const groupStandings = () => {
        if (!standings) return {};

        const groups = {};

        standings.forEach(team => {
            let groupName;
            if (viewMode === 'division') {
                groupName = team.divisionName;
            } else {
                groupName = team.conferenceName;
            }

            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(team);
        });

        return groups;
    };

    const groupedStandings = groupStandings();

    // Custom order for divisions/conferences
    const orderedGroups = viewMode === 'division'
        ? ['Atlantic', 'Metropolitan', 'Central', 'Pacific']
        : ['Eastern', 'Western'];

    // Filter to ensure we only show groups that exist in data
    const displayGroups = orderedGroups.filter(name => groupedStandings[name]);

    // Determine playoff positions
    const getPlayoffStatus = (team) => {
        if (viewMode === 'division') {
            // Top 3 in each division make playoffs
            if (team.divisionSequence <= 3) {
                return 'playoff-division';
            }
            // Check for wild card (top 2 non-division-leaders in each conference)
            if (team.wildcardSequence > 0 && team.wildcardSequence <= 2) {
                return 'playoff-wildcard';
            }
        } else {
            // In conference view, top 8 make playoffs
            if (team.conferenceSequence <= 8) {
                // Top 3 in division are division leaders
                if (team.divisionSequence <= 3) {
                    return 'playoff-division';
                } else {
                    // Teams 4-8 in conference who aren't top 3 in division are wild cards
                    // But only if they're in the wild card spots (wildcardSequence 1 or 2)
                    if (team.wildcardSequence > 0 && team.wildcardSequence <= 2) {
                        return 'playoff-wildcard';
                    }
                }
            }
        }
        return null;
    };

    return (
        <div className="standings-page">
            <h2 className="page-title">Standings</h2>

            <div className="view-controls">
                <button
                    className={`view-btn ${viewMode === 'division' ? 'active' : ''}`}
                    onClick={() => setViewMode('division')}
                >
                    Division
                </button>
                <button
                    className={`view-btn ${viewMode === 'conference' ? 'active' : ''}`}
                    onClick={() => setViewMode('conference')}
                >
                    Conference
                </button>
            </div>

            <div className="standings-container">
                {displayGroups.map(groupName => (
                    <div key={groupName} className="standings-group">
                        <h3 className="group-title">{groupName} {viewMode === 'division' ? 'Division' : 'Conference'}</h3>
                        <div className="table-responsive">
                            <table className="standings-table">
                                <thead>
                                    <tr>
                                        <th className="rank-col">#</th>
                                        <th className="team-col">Team</th>
                                        <th>GP</th>
                                        <th>W</th>
                                        <th>L</th>
                                        <th>OTL</th>
                                        <th>PTS</th>
                                        <th>DIFF</th>
                                        <th>STRK</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedStandings[groupName].map((team) => {
                                        const playoffStatus = getPlayoffStatus(team);
                                        return (
                                            <tr key={team.teamAbbrev.default} className={playoffStatus || ''}>
                                                <td className="rank-col">{viewMode === 'division' ? team.divisionSequence : team.conferenceSequence}</td>
                                                <td className="team-col">
                                                    <div className="team-cell">
                                                        <img src={team.teamLogo} alt={team.teamCommonName.default} className="table-logo" />
                                                        <span className="table-team-name">{team.teamCommonName.default}</span>
                                                    </div>
                                                </td>
                                                <td>{team.gamesPlayed}</td>
                                                <td>{team.wins}</td>
                                                <td>{team.losses}</td>
                                                <td>{team.otLosses}</td>
                                                <td className="points-cell">{team.points}</td>
                                                <td className={team.goalDifferential > 0 ? 'diff-pos' : team.goalDifferential < 0 ? 'diff-neg' : ''}>
                                                    {team.goalDifferential > 0 ? '+' : ''}{team.goalDifferential}
                                                </td>
                                                <td>{team.streakCode}{team.streakCount}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StandingsPage;
