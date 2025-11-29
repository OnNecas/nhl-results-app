import React from 'react';
import { Link } from 'react-router-dom';

const MatchCard = ({ game }) => {
    const { id, awayTeam, homeTeam, startTimeUTC, gameState, periodDescriptor } = game;

    const startTime = new Date(startTimeUTC).toLocaleTimeString('en-US', {
        timeZone: 'Europe/Prague',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const isLive = gameState === 'LIVE' || gameState === 'CRIT';
    const isFinal = gameState === 'FINAL' || gameState === 'OFF';

    return (
        <Link to={`/game/${id}`} className="match-card-link">
            <div className="match-card">
                <div className="team away">
                    <img src={awayTeam.logo} alt={awayTeam.commonName.default} className="team-logo" />
                    <span className="team-name">{awayTeam.abbrev}</span>
                    {isLive || isFinal ? <span className="score">{awayTeam.score}</span> : null}
                </div>

                <div className="match-info">
                    {isLive && <span className="status live">LIVE • {periodDescriptor.periodType} {periodDescriptor.number}</span>}
                    {isFinal && <span className="status final">FINAL</span>}
                    <span className={`start-time ${isFinal ? 'final-time' : ''}`}>{startTime}</span>
                </div>

                <div className="team home">
                    <img src={homeTeam.logo} alt={homeTeam.commonName.default} className="team-logo" />
                    <span className="team-name">{homeTeam.abbrev}</span>
                    {isLive || isFinal ? <span className="score">{homeTeam.score}</span> : null}
                </div>
            </div>
        </Link>
    );
};

export default MatchCard;
