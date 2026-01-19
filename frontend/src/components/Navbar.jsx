import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiFileText, FiActivity, FiShare2, FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          🏥 Health Wallet
        </Link>
        
        {isAuthenticated && (
          <ul className="navbar-nav">
            <li>
              <Link to="/dashboard" className="navbar-link">
                <FiHome /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/reports" className="navbar-link">
                <FiFileText /> Reports
              </Link>
            </li>
            <li>
              <Link to="/vitals" className="navbar-link">
                <FiActivity /> Vitals
              </Link>
            </li>
            <li>
              <Link to="/shared" className="navbar-link">
                <FiShare2 /> Shared
              </Link>
            </li>
            <li>
              <Link to="/profile" className="navbar-link">
                <FiUser /> {user?.full_name}
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-outline">
                <FiLogOut /> Logout
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
