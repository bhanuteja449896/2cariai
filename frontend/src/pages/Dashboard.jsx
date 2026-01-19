import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService, vitalsService } from '../services';
import { FiFileText, FiActivity, FiUpload, FiTrendingUp } from 'react-icons/fi';
import Loading from '../components/Loading';
import HealthCheck from '../components/HealthCheck';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    recentReports: [],
    vitalsSummary: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reportsData, vitalsData] = await Promise.all([
        reportService.getReports(),
        vitalsService.getVitalsSummary()
      ]);

      setStats({
        totalReports: reportsData.reports.length,
        recentReports: reportsData.reports.slice(0, 5),
        vitalsSummary: vitalsData.summary
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to your Health Wallet</p>
        </div>

        {/* Health Check Component */}
        <HealthCheck />

        <div className="grid grid-cols-3 mb-3">
          <div className="card">
            <div className="flex-between">
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalReports}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Total Reports</p>
              </div>
              <FiFileText size={40} color="var(--primary-color)" />
            </div>
          </div>

          <div className="card">
            <div className="flex-between">
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.vitalsSummary.length}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Vitals Tracked</p>
              </div>
              <FiActivity size={40} color="var(--secondary-color)" />
            </div>
          </div>

          <div className="card">
            <Link to="/reports/upload" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <FiUpload /> Upload New Report
            </Link>
            <Link to="/vitals" className="btn btn-outline mt-2" style={{ width: '100%', justifyContent: 'center' }}>
              <FiTrendingUp /> View Vitals Trends
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="card">
            <h2 className="card-header">Recent Reports</h2>
            {stats.recentReports.length > 0 ? (
              <div>
                {stats.recentReports.map((report) => (
                  <Link
                    key={report.id}
                    to={`/reports/${report.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{report.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {report.report_type} • {new Date(report.report_date).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link to="/reports" className="btn btn-outline mt-2" style={{ width: '100%' }}>
                  View All Reports
                </Link>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No reports yet. Upload your first report!
              </p>
            )}
          </div>

          <div className="card">
            <h2 className="card-header">Latest Vitals</h2>
            {stats.vitalsSummary.length > 0 ? (
              <div>
                {stats.vitalsSummary.map((vital, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    <div className="flex-between">
                      <span style={{ fontWeight: '500' }}>{vital.vital_type}</span>
                      <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                        {vital.vital_value} {vital.unit}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {new Date(vital.report_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <Link to="/vitals" className="btn btn-outline mt-2" style={{ width: '100%' }}>
                  View All Vitals
                </Link>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No vitals data yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
