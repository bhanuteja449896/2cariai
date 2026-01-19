const pool = require('../config/database');

// Get vitals data over time
exports.getVitals = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vital_type, start_date, end_date } = req.query;

    let query = `
      SELECT v.*, r.report_date, r.title as report_title
      FROM vitals v
      INNER JOIN reports r ON v.report_id = r.id
      WHERE r.user_id = $1
    `;
    const params = [userId];
    let paramCount = 1;

    if (vital_type) {
      paramCount++;
      query += ` AND v.vital_type = $${paramCount}`;
      params.push(vital_type);
    }

    if (start_date) {
      paramCount++;
      query += ` AND r.report_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND r.report_date <= $${paramCount}`;
      params.push(end_date);
    }

    query += ' ORDER BY r.report_date ASC, v.created_at ASC';

    const result = await pool.query(query, params);

    res.json({ vitals: result.rows });
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get vitals summary (latest values for each vital type)
exports.getVitalsSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT DISTINCT ON (v.vital_type) 
         v.vital_type, v.vital_value, v.unit, r.report_date
       FROM vitals v
       INNER JOIN reports r ON v.report_id = r.id
       WHERE r.user_id = $1
       ORDER BY v.vital_type, r.report_date DESC, v.created_at DESC`,
      [userId]
    );

    res.json({ summary: result.rows });
  } catch (error) {
    console.error('Get vitals summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get available vital types
exports.getVitalTypes = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT DISTINCT v.vital_type
       FROM vitals v
       INNER JOIN reports r ON v.report_id = r.id
       WHERE r.user_id = $1
       ORDER BY v.vital_type`,
      [userId]
    );

    res.json({ vital_types: result.rows.map(row => row.vital_type) });
  } catch (error) {
    console.error('Get vital types error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get vitals trends (aggregated data)
exports.getVitalsTrends = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vital_type } = req.query;

    if (!vital_type) {
      return res.status(400).json({ error: 'vital_type is required' });
    }

    const result = await pool.query(
      `SELECT 
         v.vital_type,
         v.vital_value,
         v.unit,
         r.report_date,
         r.title as report_title,
         r.report_type
       FROM vitals v
       INNER JOIN reports r ON v.report_id = r.id
       WHERE r.user_id = $1 AND v.vital_type = $2
       ORDER BY r.report_date ASC`,
      [userId, vital_type]
    );

    // Calculate statistics
    const values = result.rows
      .map(row => parseFloat(row.vital_value))
      .filter(val => !isNaN(val));

    const statistics = values.length > 0 ? {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      average: values.reduce((a, b) => a + b, 0) / values.length,
      latest: values[values.length - 1]
    } : null;

    res.json({
      vital_type,
      data: result.rows,
      statistics
    });
  } catch (error) {
    console.error('Get vitals trends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
