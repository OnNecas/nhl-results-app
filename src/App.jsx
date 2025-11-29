import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SchedulePage from './pages/SchedulePage';
import ResultsPage from './pages/ResultsPage';
import MatchDetailPage from './pages/MatchDetailPage';
import StandingsPage from './pages/StandingsPage';
import AnalysisPage from './pages/AnalysisPage';

function App() {
    return (
        <Router>
            <div className="app-container">
                <header className="app-header">
                    <h1>NHL Results</h1>
                    <Navbar />
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<Navigate to="/schedule" replace />} />
                        <Route path="/schedule" element={<SchedulePage />} />
                        <Route path="/results" element={<ResultsPage />} />
                        <Route path="/standings" element={<StandingsPage />} />
                        <Route path="/analysis" element={<AnalysisPage />} />
                        <Route path="/game/:id" element={<MatchDetailPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
