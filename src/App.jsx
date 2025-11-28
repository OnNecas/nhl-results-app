
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SchedulePage from './pages/SchedulePage';
import ResultsPage from './pages/ResultsPage';

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
            <Route path="/" element={<SchedulePage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
