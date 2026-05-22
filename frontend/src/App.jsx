import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import MyApplications from './pages/MyApplications';
import JobAlerts from './pages/JobAlerts';
import AIChat from './components/AIChat';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
          <Header />
          <main className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/my-alerts" element={<JobAlerts />} />
            </Routes>
          </main>
          <AIChat />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
