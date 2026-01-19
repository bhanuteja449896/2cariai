import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reportService } from '../services';
import { formatDate, downloadFile } from '../utils/helpers';
import { FiDownload, FiShare2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import Loading from '../components/Loading';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({
    shared_with_email: '',
    shared_with_name: '',
    access_type: 'viewer'
  });

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const data = await reportService.getReport(id);
      setReport(data.report);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await reportService.downloadReport(id);
      downloadFile(blob, report.file_name);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportService.deleteReport(id);
        navigate('/reports');
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report');
      }
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      await reportService.shareReport(id, shareData);
      alert('Report shared successfully!');
      setShowShareModal(false);
      setShareData({ shared_with_email: '', shared_with_name: '', access_type: 'viewer' });
    } catch (error) {
      console.error('Error sharing report:', error);
      alert(error.response?.data?.error || 'Failed to share report');
    }
  };

  if (loading) return <Loading />;
  if (!report) return <div className="page"><div className="container">Report not found</div></div>;

  return (
    <div className="page">
      <div className="container">
        <Link to="/reports" className="btn btn-outline mb-3">
          <FiArrowLeft /> Back to Reports
        </Link>

        <div className="card">
          <div className="flex-between mb-3">
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {report.title}
              </h1>
              <div className="flex gap-2" style={{ fontSize: '0.875rem' }}>
                <span className="badge badge-primary">{report.report_type}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Date: {formatDate(report.report_date)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDownload} className="btn btn-primary">
                <FiDownload /> Download
              </button>
              <button onClick={() => setShowShareModal(true)} className="btn btn-secondary">
                <FiShare2 /> Share
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>

          {report.notes && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Notes</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{report.notes}</p>
            </div>
          )}

          {report.vitals && report.vitals.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Vitals</h3>
              <div className="grid grid-cols-3">
                {report.vitals.map((vital, index) => (
                  <div key={index} className="card">
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {vital.vital_type}
                      </p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {vital.vital_value}
                      </p>
                      {vital.unit && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {vital.unit}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>File Information</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <strong>File Name:</strong> {report.file_name}
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <strong>File Type:</strong> {report.file_type}
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              <strong>Uploaded:</strong> {formatDate(report.created_at)}
            </p>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Share Report</h3>
              <button className="modal-close" onClick={() => setShowShareModal(false)}>×</button>
            </div>
            <form onSubmit={handleShare}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Recipient Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={shareData.shared_with_email}
                    onChange={(e) => setShareData({ ...shareData, shared_with_email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Recipient Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shareData.shared_with_name}
                    onChange={(e) => setShareData({ ...shareData, shared_with_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Access Type</label>
                  <select
                    className="form-select"
                    value={shareData.access_type}
                    onChange={(e) => setShareData({ ...shareData, access_type: e.target.value })}
                  >
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowShareModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Share Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
