import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services';
import { REPORT_TYPES, VITAL_TYPES } from '../utils/constants';
import { FiPlus, FiX } from 'react-icons/fi';

const UploadReport = () => {
  const [formData, setFormData] = useState({
    title: '',
    report_type: '',
    report_date: new Date().toISOString().split('T')[0],
    notes: '',
    file: null
  });
  const [vitals, setVitals] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const addVital = () => {
    setVitals([...vitals, { vital_type: '', vital_value: '', unit: '' }]);
  };

  const removeVital = (index) => {
    setVitals(vitals.filter((_, i) => i !== index));
  };

  const handleVitalChange = (index, field, value) => {
    const newVitals = [...vitals];
    newVitals[index][field] = value;
    setVitals(newVitals);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('file', formData.file);
      data.append('title', formData.title);
      data.append('report_type', formData.report_type);
      data.append('report_date', formData.report_date);
      data.append('notes', formData.notes);
      
      // Filter out empty vitals and add to form data
      const validVitals = vitals.filter(v => v.vital_type && v.vital_value);
      if (validVitals.length > 0) {
        data.append('vitals', JSON.stringify(validVitals));
      }

      await reportService.uploadReport(data);
      setSuccess('Report uploaded successfully!');
      setTimeout(() => {
        navigate('/reports');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="card">
            <h2 className="card-header">Upload Medical Report</h2>
            
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Report Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Annual Health Checkup 2024"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Report Type *</label>
                <select
                  name="report_type"
                  className="form-select"
                  value={formData.report_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Report Type</option>
                  {REPORT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Report Date *</label>
                <input
                  type="date"
                  name="report_date"
                  className="form-control"
                  value={formData.report_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">File (PDF or Image) *</label>
                <input
                  type="file"
                  name="file"
                  className="form-control"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                <small style={{ color: 'var(--text-secondary)' }}>
                  Supported formats: PDF, JPG, PNG (Max 5MB)
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes or observations..."
                />
              </div>

              <div className="form-group">
                <div className="flex-between mb-2">
                  <label className="form-label" style={{ marginBottom: 0 }}>Vitals (Optional)</label>
                  <button type="button" onClick={addVital} className="btn btn-outline">
                    <FiPlus /> Add Vital
                  </button>
                </div>

                {vitals.map((vital, index) => (
                  <div key={index} className="grid grid-cols-3 mb-2" style={{ alignItems: 'end' }}>
                    <div>
                      <select
                        className="form-select"
                        value={vital.vital_type}
                        onChange={(e) => handleVitalChange(index, 'vital_type', e.target.value)}
                      >
                        <option value="">Select Vital Type</option>
                        {VITAL_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Value"
                        value={vital.vital_value}
                        onChange={(e) => handleVitalChange(index, 'vital_value', e.target.value)}
                      />
                    </div>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Unit"
                        value={vital.unit}
                        onChange={(e) => handleVitalChange(index, 'unit', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeVital(index)}
                        className="btn btn-danger"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Upload Report'}
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate('/reports')} 
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReport;
