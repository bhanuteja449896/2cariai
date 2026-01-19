import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services';
import { formatDate } from '../utils/helpers';
import { FiUpload, FiDownload, FiEye, FiFilter } from 'react-icons/fi';
import { REPORT_TYPES } from '../utils/constants';
import Loading from '../components/Loading';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    report_type: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getReports(filterParams);
      setReports(data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.response?.data?.error || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = () => {
    const filterParams = {};
    if (filters.report_type) filterParams.report_type = filters.report_type;
    if (filters.start_date) filterParams.start_date = filters.start_date;
    if (filters.end_date) filterParams.end_date = filters.end_date;
    fetchReports(filterParams);
  };

  const clearFilters = () => {
    setFilters({
      report_type: '',
      start_date: '',
      end_date: ''
    });
    fetchReports();
  };

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">Medical Reports</h1>
            <p className="page-subtitle">View and manage your health records</p>
          </div>
          <Link to="/reports/upload" className="btn btn-primary">
            <FiUpload /> Upload Report
          </Link>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <div className="card">
          <h3 className="mb-2"><FiFilter /> Filters</h3>
          <div className="grid grid-cols-3 mb-2">
            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select
                name="report_type"
                className="form-select"
                value={filters.report_type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="start_date"
                className="form-control"
                value={filters.start_date}
                onChange={handleFilterChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                name="end_date"
                className="form-control"
                value={filters.end_date}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={applyFilters} className="btn btn-primary">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="btn btn-outline">
              Clear Filters
            </button>
          </div>
        </div>

        {reports.length > 0 ? (
          <div className="grid">
            {reports.map((report) => (
              <div key={report.id} className="card">
                <div className="flex-between mb-2">
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {report.title}
                    </h3>
                    <div className="flex gap-2" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span className="badge badge-primary">{report.report_type}</span>
                      <span>{formatDate(report.report_date)}</span>
                    </div>
                  </div>
                  <Link to={`/reports/${report.id}`} className="btn btn-primary">
                    <FiEye /> View
                  </Link>
                </div>

                {report.vitals && report.vitals.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Vitals:</p>
                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                      {report.vitals.map((vital, index) => (
                        <span key={index} className="badge badge-success">
                          {vital.vital_type}: {vital.vital_value} {vital.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {report.notes && (
                  <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {report.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <FiFileText size={64} color="var(--text-secondary)" style={{ margin: '0 auto' }} />
            <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>No Reports Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {filters.report_type || filters.start_date || filters.end_date
                ? 'Try adjusting your filters'
                : 'Upload your first medical report to get started'}
            </p>
            <Link to="/reports/upload" className="btn btn-primary">
              <FiUpload /> Upload Report
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
