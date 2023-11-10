/* eslint-disable */
import './App.css';
import React from 'react';
import { Navbar } from 'react-bootstrap';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import CreateElectionPage from './CreateElectionPage';
import VotePage from './VotePage';
import HomePage from './HomePage';
import Results from './Results';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route exact path="/" element={<HomePage />} />
                <Route path="/create" element={<CreateElectionPage />} />
                <Route path="/vote/:electionId" element={<VotePage />} />
                <Route path="/results/:electionId" element={<Results />} />
            </Routes>
        </Router>
    );
}

export default App;
