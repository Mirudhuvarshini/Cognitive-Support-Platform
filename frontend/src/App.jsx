import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import TaskPlanner from './components/TaskPlanner';
import MoodTracker from './components/MoodTracker';
import FocusTimer from './components/FocusTimer';
import SafePlaces from './components/SafePlaces';
import SOSButton from './components/SOSButton';
import AIChatbot from './components/AIChatbot';
import GamifiedLearning from './components/GamifiedLearning';
import ConditionDetails from './components/ConditionDetails';
import EmergencyContacts from './components/EmergencyContacts';
import SelfCare from './components/SelfCare';
import Journal from './components/Journal';
import RoutineBuilder from './components/RoutineBuilder';
import CommunicationCards from './components/CommunicationCards';
import CaregiverDashboard from './components/CaregiverDashboard';
import Community from './components/Community';
import Analytics from './components/Analytics';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <div className="app-container">
                        <Navbar />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/onboarding" element={<Onboarding />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/tasks" element={<TaskPlanner />} />
                                <Route path="/mood" element={<MoodTracker />} />
                                <Route path="/focus" element={<FocusTimer />} />
                                <Route path="/places" element={<SafePlaces />} />
                                <Route path="/learning" element={<GamifiedLearning />} />
                                <Route path="/condition/:id" element={<ConditionDetails />} />
                                <Route path="/emergency" element={<EmergencyContacts />} />
                                <Route path="/self-care" element={<SelfCare />} />
                                <Route path="/journal" element={<Journal />} />
                                <Route path="/routines" element={<RoutineBuilder />} />
                                <Route path="/communication-cards" element={<CommunicationCards />} />
                                <Route path="/caregiver" element={<CaregiverDashboard />} />
                                <Route path="/community" element={<Community />} />
                                <Route path="/analytics" element={<Analytics />} />
                            </Routes>
                        </main>
                        <SOSButton />
                        <AIChatbot />
                        <AccessibilityToolbar />
                    </div>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
