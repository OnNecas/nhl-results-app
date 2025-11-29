import React, { useEffect, useState } from 'react';
import { fetchPlayerStats } from '../services/api';
import PCAAnalysis from '../components/PCAAnalysis';
import ShootingAnalysis from '../components/ShootingAnalysis';

const AnalysisPage = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pca'); // 'pca' or 'shooting'

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchPlayerStats();
                setPlayers(response.data);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load player stats');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="analysis-page">
            <h2 className="page-title">Player Analysis</h2>

            <div className="analysis-tabs">
                <button
                    className={`tab-button ${activeTab === 'pca' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pca')}
                >
                    PCA Analysis
                </button>
                <button
                    className={`tab-button ${activeTab === 'shooting' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shooting')}
                >
                    Shooting Efficiency
                </button>
            </div>

            {activeTab === 'pca' ? (
                <PCAAnalysis players={players} />
            ) : (
                <ShootingAnalysis players={players} />
            )}
        </div>
    );
};

export default AnalysisPage;
