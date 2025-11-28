
import React from 'react';
import MatchList from '../components/MatchList';
import { fetchRecentResults } from '../services/api';

const ResultsPage = () => {
    return (
        <div className="page-container">
            <h2 className="page-title">Recent Results</h2>
            <MatchList fetchFunction={fetchRecentResults} sortDescending={true} />
        </div>
    );
};

export default ResultsPage;
