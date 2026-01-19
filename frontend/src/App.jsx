import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import UploadReport from './pages/UploadReport';
import ReportDetail from './pages/ReportDetail';
import Vitals from './pages/Vitals';
import SharedReports from './pages/SharedReports';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/reports" element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            } />
            
            <Route path="/reports/upload" element={
              <PrivateRoute>
                <UploadReport />
              </PrivateRoute>
            } />
            
            <Route path="/reports/:id" element={
              <PrivateRoute>
                <ReportDetail />
              </PrivateRoute>
            } />
            
            <Route path="/vitals" element={
              <PrivateRoute>
                <Vitals />
              </PrivateRoute>
            } />
            
            <Route path="/shared" element={
              <PrivateRoute>
                <SharedReports />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
