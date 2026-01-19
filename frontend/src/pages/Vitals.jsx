import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { vitalsService } from '../services';
import { formatDate } from '../utils/helpers';
import Loading from '../components/Loading';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Vitals = () => {
  const [vitalTypes, setVitalTypes] = useState([]);
  const [selectedVitalType, setSelectedVitalType] = useState('');
  const [trendsData, setTrendsData] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedVitalType) {
      fetchTrends();
    }
  }, [selectedVitalType]);

  const fetchInitialData = async () => {
    try {
      const [typesData, summaryData] = await Promise.all([
        vitalsService.getVitalTypes(),
        vitalsService.getVitalsSummary()
      ]);

      setVitalTypes(typesData.vital_types);
      setSummary(summaryData.summary);

      if (typesData.vital_types.length > 0) {
        setSelectedVitalType(typesData.vital_types[0]);
      }
    } catch (error) {
      console.error('Error fetching vitals data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const data = await vitalsService.getVitalsTrends(selectedVitalType);
      setTrendsData(data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  const getChartData = () => {
    if (!trendsData || !trendsData.data) return null;

    return {
      labels: trendsData.data.map(item => formatDate(item.report_date)),
      datasets: [
        {
          label: selectedVitalType,
          data: trendsData.data.map(item => parseFloat(item.vital_value)),
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.3
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: `${selectedVitalType} Trend Over Time`
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Vitals Tracking</h1>
          <p className="page-subtitle">Monitor your health vitals over time</p>
        </div>

        <div className="grid grid-cols-2 mb-3">
          <div className="card">
            <h2 className="card-header">Latest Vitals Summary</h2>
            {summary.length > 0 ? (
              <div className="grid grid-cols-2">
                {summary.map((vital, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: selectedVitalType === vital.vital_type ? 'var(--bg-secondary)' : 'transparent'
                    }}
                    onClick={() => setSelectedVitalType(vital.vital_type)}
                  >
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
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      {formatDate(vital.report_date)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No vitals data available. Upload reports with vitals to track them.
              </p>
            )}
          </div>

          <div className="card">
            <h2 className="card-header">Select Vital Type</h2>
            {vitalTypes.length > 0 ? (
              <div>
                <select
                  className="form-select"
                  value={selectedVitalType}
                  onChange={(e) => setSelectedVitalType(e.target.value)}
                >
                  {vitalTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                {trendsData && trendsData.statistics && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Statistics</h3>
                    <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Count</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{trendsData.statistics.count}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Latest</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                          {trendsData.statistics.latest.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Average</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                          {trendsData.statistics.average.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Range</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                          {trendsData.statistics.min.toFixed(2)} - {trendsData.statistics.max.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No vital types available
              </p>
            )}
          </div>
        </div>

        {trendsData && trendsData.data && trendsData.data.length > 0 && (
          <div className="card">
            <h2 className="card-header">Trend Chart</h2>
            <div style={{ padding: '1rem' }}>
              <Line data={getChartData()} options={chartOptions} />
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Data History</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Value</th>
                      <th>Unit</th>
                      <th>Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendsData.data.map((item, index) => (
                      <tr key={index}>
                        <td>{formatDate(item.report_date)}</td>
                        <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                          {item.vital_value}
                        </td>
                        <td>{item.unit}</td>
                        <td>{item.report_title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vitals;
