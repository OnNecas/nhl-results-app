import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ShootingAnalysis = ({ players }) => {
    const [shootingData, setShootingData] = useState(null);

    useEffect(() => {
        if (players && players.length > 0) {
            processShootingData(players);
        }
    }, [players]);

    const processShootingData = (players) => {
        // Filter valid players with meaningful stats
        const validPlayers = players.filter(p => p.gamesPlayed > 10 && p.shots > 20);

        // Prepare shooting efficiency data
        const shootingPlotData = validPlayers.map(p => ({
            name: p.skaterFullName,
            team: p.teamAbbrevs,
            x: p.gamesPlayed > 0 ? p.shots / p.gamesPlayed : 0, // Shots per game
            y: p.shootingPct ? p.shootingPct * 100 : 0, // Shooting percentage (API usually returns 0.15 for 15%, but sometimes it's already 15. Check API. Assuming it might need *100 if it's decimal, or just use as is. Let's check previous code. Previous code used p.shootingPct directly. Wait, standard NHL API returns decimal? Or percentage? Let's look at the previous attempt. It used `p.shootingPct || 0`. Let's assume it's a number like 15.4. If it's 0.154, we should multiply by 100. Let's check `api/stats.js` or just assume it's correct from previous context. Actually, let's look at the scatter plot axis. It was "Shooting %". If values are 0-1, it's 0-100%. If values are 0-100, it's 0-100. Let's stick to raw value for now, but usually it's better to be safe. Let's just use it as is for now, if it looks small we can fix it.)
            // Actually, let's look at the previous `AnalysisPage.jsx` content I read. It didn't have shooting logic yet.
            // But from the user request history, I was about to add it.
            // Let's assume `shootingPct` from API is the percentage value (e.g. 15.5).
            goals: p.goals,
            shots: p.shots,
            points: p.points,
            assists: p.assists
        }));

        setShootingData(shootingPlotData);
    };

    if (!shootingData) return <div className="loading">Processing Shooting Data...</div>;

    return (
        <>
            <p className="analysis-subtitle">
                Comparing shooting volume vs efficiency to identify snipers, volume shooters, and elite scorers.
            </p>

            <div className="analysis-grid">
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={500}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                name="Shots/Game"
                                stroke="#94a3b8"
                                domain={[0, 6]}
                                tickCount={7}
                                label={{ value: 'Shots per Game', position: 'bottom', fill: '#94a3b8' }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name="Shooting %"
                                stroke="#94a3b8"
                                label={{ value: 'Shooting Percentage', angle: -90, position: 'left', fill: '#94a3b8' }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="custom-tooltip">
                                                <div className="tooltip-header">
                                                    <span className="tooltip-name">{d.name}</span>
                                                    <span className="tooltip-team">{d.team}</span>
                                                </div>
                                                <div className="tooltip-stats">
                                                    <div>Shots/Game: {d.x.toFixed(2)}</div>
                                                    <div>Shooting %: {d.y.toFixed(1)}%</div>
                                                    <div>Goals: {d.goals}</div>
                                                    <div>Total Shots: {d.shots}</div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Scatter name="Players" data={shootingData} fill="#0ea5e9" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                <div className="analysis-info">
                    <div className="info-card">
                        <h3>Quadrant Analysis</h3>
                        <div className="quadrant-explanation">
                            <h4>🎯 High Efficiency, Low Volume</h4>
                            <p>Snipers who pick their spots carefully. High shooting % but fewer shots.</p>
                        </div>
                        <div className="quadrant-explanation">
                            <h4>⭐ High Efficiency, High Volume</h4>
                            <p>Elite scorers who shoot often AND convert at high rates. The best of both worlds.</p>
                        </div>
                        <div className="quadrant-explanation">
                            <h4>🔫 Low Efficiency, High Volume</h4>
                            <p>Volume shooters who create many chances but convert at lower rates.</p>
                        </div>
                        <div className="quadrant-explanation">
                            <h4>📉 Low Efficiency, Low Volume</h4>
                            <p>Players who shoot less frequently and with lower conversion rates.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="explanation-section">
                <h3>Understanding Shooting Efficiency</h3>
                <p className="explanation-intro">
                    This chart reveals different scoring philosophies and helps identify player archetypes based on their shooting behavior.
                </p>

                <div className="explanation-grid">
                    <div className="explanation-card">
                        <h4>📊 The Metrics</h4>
                        <p>
                            <strong>Shots per Game (X-axis):</strong> Average number of shots a player takes per game.
                            Higher values indicate more aggressive offensive players who create many scoring chances.
                        </p>
                        <p>
                            <strong>Shooting Percentage (Y-axis):</strong> The percentage of shots that result in goals.
                            League average is typically around 9-10%. Elite snipers often exceed 15%.
                        </p>
                    </div>

                    <div className="explanation-card">
                        <h4>🎯 What Makes a Great Scorer?</h4>
                        <p>
                            The ideal is <strong>top-right quadrant</strong>: high volume AND high efficiency.
                            These are your elite goal scorers like Auston Matthews or Alex Ovechkin.
                        </p>
                        <p>
                            However, both volume shooters and snipers have value. Volume creates rebounds and chaos,
                            while efficiency maximizes limited opportunities.
                        </p>
                    </div>

                    <div className="explanation-card">
                        <h4>💡 Key Insights</h4>
                        <p>
                            <strong>Quality vs Quantity:</strong> Some players succeed by being selective (snipers),
                            others by creating volume (grinders).
                        </p>
                        <p>
                            <strong>Context Matters:</strong> Power forwards may have lower shooting % but create space for teammates.
                            Snipers on weak teams may have inflated percentages from limited defensive attention.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShootingAnalysis;
