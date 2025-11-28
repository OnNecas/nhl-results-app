
import React from 'react';
import MatchList from '../components/MatchList';
import { fetchUpcomingSchedule } from '../services/api';

const SchedulePage = () => {
    return (
        <div className="page-container">
            <h2 className="page-title">Upcoming Games</h2>
            <MatchList fetchFunction={fetchUpcomingSchedule} />
        </div>
    );
};

export default SchedulePage;
