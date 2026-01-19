import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const HealthCheck = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/health');
      setHealth(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: '1rem' }}>Checking server health...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex-between mb-2">
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
          Server Health Status
        </h3>
        <button onClick={checkHealth} className="btn btn-outline" disabled={loading}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <FiXCircle /> Connection failed: {error}
        </div>
      )}

      {health && (
        <div>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: health.status === 'OK' ? '#d1fae5' : '#fee2e2',
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}>
            <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
              {health.status === 'OK' ? (
                <FiCheckCircle size={24} color="#065f46" />
              ) : (
                <FiXCircle size={24} color="#991b1b" />
              )}
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold',
                color: health.status === 'OK' ? '#065f46' : '#991b1b'
              }}>
                {health.status === 'OK' ? 'Server is Running' : 'Server Error'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Status
              </p>
              <p style={{ fontWeight: '600' }}>{health.status}</p>
            </div>

            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Environment
              </p>
              <p style={{ fontWeight: '600' }}>{health.environment}</p>
            </div>

            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Database
              </p>
              <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                {health.database?.connected ? (
                  <>
                    <FiCheckCircle color="#065f46" />
                    <span style={{ fontWeight: '600', color: '#065f46' }}>Connected</span>
                  </>
                ) : (
                  <>
                    <FiXCircle color="#991b1b" />
                    <span style={{ fontWeight: '600', color: '#991b1b' }}>Disconnected</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Last Check
              </p>
              <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                {new Date(health.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {health.message && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '0.375rem'
            }}>
              <p style={{ fontSize: '0.875rem' }}>
                <strong>Message:</strong> {health.message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthCheck;
