
import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <NavLink
                    to="/"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    Schedule
                </NavLink>
                <NavLink
                    to="/results"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    Results
                </NavLink>
                <NavLink
                    to="/standings"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    Standings
                </NavLink>
                <NavLink
                    to="/analysis"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    Analysis
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;
