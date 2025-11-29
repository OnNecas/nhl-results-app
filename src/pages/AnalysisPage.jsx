import React, { useEffect, useState } from 'react';
import { fetchPlayerStats } from '../services/api';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

// Simple PCA implementation using covariance matrix
const performPCA = (data, numComponents = 2) => {
    const n = data.length;
    const m = data[0].length;

    // Center the data
    const means = [];
    for (let j = 0; j < m; j++) {
        const sum = data.reduce((acc, row) => acc + row[j], 0);
        means.push(sum / n);
    }

    const centered = data.map(row =>
        row.map((val, j) => val - means[j])
    );

    // Compute covariance matrix
    const cov = Array(m).fill(0).map(() => Array(m).fill(0));
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) {
                sum += centered[k][i] * centered[k][j];
            }
            cov[i][j] = sum / (n - 1);
        }
    }

    // Simple power iteration for first 2 principal components
    const components = [];
    for (let comp = 0; comp < numComponents; comp++) {
        let vector = Array(m).fill(0).map(() => Math.random());

        // Power iteration
        for (let iter = 0; iter < 100; iter++) {
            // Multiply by covariance matrix
            const newVector = Array(m).fill(0);
            for (let i = 0; i < m; i++) {
                for (let j = 0; j < m; j++) {
                    newVector[i] += cov[i][j] * vector[j];
                }
            }

            // Orthogonalize against previous components
            for (const prevComp of components) {
                const dot = newVector.reduce((sum, val, i) => sum + val * prevComp[i], 0);
                for (let i = 0; i < m; i++) {
                    newVector[i] -= dot * prevComp[i];
                }
            }

            // Normalize
            const norm = Math.sqrt(newVector.reduce((sum, val) => sum + val * val, 0));
            if (norm > 0) {
                vector = newVector.map(val => val / norm);
            }
        }

        components.push(vector);
    }

    // Project data onto principal components
    const transformed = centered.map(row =>
        components.map(comp =>
            row.reduce((sum, val, i) => sum + val * comp[i], 0)
        )
    );

    return {
        components,
        transformed
    };
};

const AnalysisPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadings, setLoadings] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchPlayerStats();
                processData(response.data);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load player stats');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const processData = (players) => {
        // Filter valid players
        const validPlayers = players.filter(p => p.gamesPlayed > 10);

        // Select features - using correct API field names
        const features = ['goals', 'assists', 'points', 'plusMinus', 'penaltyMinutes', 'ppPoints', 'shPoints', 'shots'];

        // Prepare matrix with null handling
        const matrix = validPlayers.map(p =>
            features.map(f => {
                const val = p[f];
                return (val === null || val === undefined || isNaN(val)) ? 0 : Number(val);
            })
        );

        // Normalize
        const normalized = normalize(matrix);

        // PCA
        const pcaResult = performPCA(normalized, 2);

        // Loadings
        const topLoadings = {
            pc1: pcaResult.components[0].map((val, i) => ({ feature: features[i], value: Math.abs(val) })).sort((a, b) => b.value - a.value).slice(0, 3),
            pc2: pcaResult.components[1].map((val, i) => ({ feature: features[i], value: Math.abs(val) })).sort((a, b) => b.value - a.value).slice(0, 3)
        };
        setLoadings(topLoadings);

        // Clustering
        const clusters = kMeans(pcaResult.transformed, 4);

        // Plot data
        const plotData = validPlayers.map((p, i) => ({
            name: p.skaterFullName,
            team: p.teamAbbrevs,
            x: pcaResult.transformed[i][0],
            y: pcaResult.transformed[i][1],
            cluster: clusters[i],
            points: p.points,
            goals: p.goals,
            assists: p.assists,
            plusMinus: p.plusMinus
        }));

        console.log('Sample:', plotData[0]);
        setData(plotData);
    };

    const normalize = (matrix) => {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const normalized = [];

        for (let j = 0; j < cols; j++) {
            const colValues = matrix.map(row => row[j]);
            const mean = colValues.reduce((a, b) => a + b, 0) / rows;
            const stdDev = Math.sqrt(colValues.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / rows) || 1;

            for (let i = 0; i < rows; i++) {
                if (!normalized[i]) normalized[i] = [];
                normalized[i][j] = (matrix[i][j] - mean) / stdDev;
            }
        }
        return normalized;
    };

    const kMeans = (data, k) => {
        const points = data;
        let centroids = points.slice(0, k);
        let assignments = new Array(points.length).fill(0);

        for (let iter = 0; iter < 20; iter++) {
            let changes = 0;
            points.forEach((p, i) => {
                let minDist = Infinity;
                let cluster = 0;
                centroids.forEach((c, j) => {
                    const dist = Math.sqrt(Math.pow(p[0] - c[0], 2) + Math.pow(p[1] - c[1], 2));
                    if (dist < minDist) {
                        minDist = dist;
                        cluster = j;
                    }
                });
                if (assignments[i] !== cluster) {
                    assignments[i] = cluster;
                    changes++;
                }
            });

            if (changes === 0) break;

            for (let j = 0; j < k; j++) {
                const clusterPoints = points.filter((_, i) => assignments[i] === j);
                if (clusterPoints.length > 0) {
                    const meanX = clusterPoints.reduce((sum, p) => sum + p[0], 0) / clusterPoints.length;
                    const meanY = clusterPoints.reduce((sum, p) => sum + p[1], 0) / clusterPoints.length;
                    centroids[j] = [meanX, meanY];
                }
            }
        }
        return assignments;
    };

    const COLORS = ['#0ea5e9', '#f43f5e', '#10b981', '#f59e0b'];

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!data) return <div className="loading">Processing...</div>;

    return (
        <div className="analysis-page">
            <h2 className="page-title">Player Clustering Analysis (PCA)</h2>
            <p className="analysis-subtitle">
                Analyzing top players based on offensive metrics. Players grouped into 4 clusters.
            </p>

            <div className="analysis-grid">
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={500}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis type="number" dataKey="x" name="PC1" stroke="#94a3b8" />
                            <YAxis type="number" dataKey="y" name="PC2" stroke="#94a3b8" />
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
                                                    <div>Points: {d.points}</div>
                                                    <div>Goals: {d.goals}</div>
                                                    <div>Assists: {d.assists}</div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Scatter name="Players" data={data} fill="#0ea5e9">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.cluster]} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                <div className="analysis-info">
                    <div className="info-card">
                        <h3>Component Interpretation</h3>
                        <div className="pc-explanation">
                            <h4>PC1 (X-Axis)</h4>
                            <p>Driven by: {loadings?.pc1.map(l => l.feature).join(', ')}</p>
                        </div>
                        <div className="pc-explanation">
                            <h4>PC2 (Y-Axis)</h4>
                            <p>Driven by: {loadings?.pc2.map(l => l.feature).join(', ')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisPage;
