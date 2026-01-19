import React, { useState, useEffect } from 'react';
import { reportService } from '../services';
import { formatDate } from '../utils/helpers';
import { FiShare2, FiUser, FiCalendar } from 'react-icons/fi';
import Loading from '../components/Loading';

const SharedReports = () => {
  const [sharedReports, setSharedReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedReports();
  }, []);

  const fetchSharedReports = async () => {
    try {
      const data = await reportService.getSharedReports();
      setSharedReports(data.reports);
    } catch (error) {
      console.error('Error fetching shared reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId, fileName) => {
    try {
      const blob = await reportService.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Shared Reports</h1>
          <p className="page-subtitle">Reports shared with you by others</p>
        </div>

        {sharedReports.length > 0 ? (
          <div className="grid">
            {sharedReports.map((report) => (
              <div key={report.id} className="card">
                <div className="flex-between mb-2">
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {report.title}
                    </h3>
                    <div className="flex gap-2" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
                      <span className="badge badge-primary">{report.report_type}</span>
                      <span><FiCalendar /> {formatDate(report.report_date)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(report.id, report.file_name)}
                    className="btn btn-primary"
                  >
                    Download
                  </button>
                </div>

                <div style={{ 
                  marginTop: '1rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div>
                    <FiUser style={{ display: 'inline', marginRight: '0.25rem' }} />
                    <strong>Shared by:</strong> {report.owner_name} ({report.owner_email})
                  </div>
                  <div>
                    <FiShare2 style={{ display: 'inline', marginRight: '0.25rem' }} />
                    <strong>Access:</strong> {report.access_type}
                  </div>
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
                    <strong>Notes:</strong> {report.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <FiShare2 size={64} color="var(--text-secondary)" style={{ margin: '0 auto' }} />
            <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>No Shared Reports</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              When others share reports with you, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedReports;
