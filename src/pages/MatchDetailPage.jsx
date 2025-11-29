import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchGameLanding } from '../services/api';

const MatchDetailPage = () => {
    const { id } = useParams();
    const [gameData, setGameData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadGame = async () => {
            try {
                const data = await fetchGameLanding(id);
                setGameData(data);
            } catch (err) {
                setError('Failed to load game details');
            } finally {
                setLoading(false);
            }
        };
        loadGame();
    }, [id]);

    if (loading) return <div className="loading">Loading game details...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!gameData) return <div className="error">Game not found</div>;

    const { awayTeam, homeTeam, summary } = gameData;
    const scoring = summary?.scoring || [];

    return (
        <div className="match-detail-page">
            <Link to="/results" className="back-link">← Back to Results</Link>

            <div className="detail-header">
                <div className="team-detail away">
                    <img src={awayTeam.logo} alt={awayTeam.commonName.default} className="team-logo-large" />
                    <span className="team-name-large">{awayTeam.commonName.default}</span>
                    <span className="score-large">{awayTeam.score}</span>
                </div>

                <div className="versus">VS</div>

                <div className="team-detail home">
                    <span className="score-large">{homeTeam.score}</span>
                    <span className="team-name-large">{homeTeam.commonName.default}</span>
                    <img src={homeTeam.logo} alt={homeTeam.commonName.default} className="team-logo-large" />
                </div>
            </div>

            <div className="scoring-summary">
                <h3>Scoring Summary</h3>
                {scoring.length > 0 ? (
                    scoring.map((period) => (
                        <div key={period.periodDescriptor.number} className="period-section">
                            <h4 className="period-header">{period.periodDescriptor.periodType} {period.periodDescriptor.number}</h4>
                            {period.goals.map((goal) => (
                                <div key={goal.goalId} className="goal-item">
                                    <div className="goal-time">{goal.timeInPeriod}</div>
                                    <div className="goal-info">
                                        <div className="goal-scorer">
                                            <img src={goal.teamAbbrev.default === awayTeam.abbrev ? awayTeam.logo : homeTeam.logo} alt="Team" className="goal-team-logo" />
                                            <span className="player-name">{goal.name.default} ({goal.goalsToDate})</span>
                                        </div>
                                        <div className="goal-assists">
                                            {goal.assists.map(a => `${a.name.default} (${a.assistsToDate})`).join(', ')}
                                        </div>
                                    </div>
                                    <div className="goal-score">
                                        {goal.awayScore} - {goal.homeScore}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p className="no-goals">No goals scored yet.</p>
                )}
            </div>
        </div>
    );
};

export default MatchDetailPage;
