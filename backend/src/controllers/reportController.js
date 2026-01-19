const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

// Upload new report
exports.uploadReport = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { title, report_type, report_date, notes, vitals } = req.body;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    await client.query('BEGIN');

    // Insert report
    const reportResult = await client.query(
      `INSERT INTO reports (user_id, title, report_type, file_path, file_name, file_type, report_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        title,
        report_type,
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        report_date,
        notes
      ]
    );

    const report = reportResult.rows[0];

    // Insert vitals if provided
    if (vitals && Array.isArray(vitals)) {
      for (const vital of vitals) {
        await client.query(
          `INSERT INTO vitals (report_id, vital_type, vital_value, unit)
           VALUES ($1, $2, $3, $4)`,
          [report.id, vital.vital_type, vital.vital_value, vital.unit]
        );
      }
    }

    await client.query('COMMIT');

    // Fetch complete report with vitals
    const completeReport = await getReportById(report.id);

    res.status(201).json({
      message: 'Report uploaded successfully',
      report: completeReport
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Upload report error:', error);
    
    // Delete uploaded file if database operation failed
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    
    res.status(500).json({ error: 'Server error during upload' });
  } finally {
    client.release();
  }
};

// Get all reports for current user
exports.getReports = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { report_type, start_date, end_date, vital_type } = req.query;

    let query = `
      SELECT DISTINCT r.*
      FROM reports r
      LEFT JOIN vitals v ON r.id = v.report_id
      WHERE r.user_id = $1
    `;
    const params = [userId];
    let paramCount = 1;

    if (report_type) {
      paramCount++;
      query += ` AND r.report_type = $${paramCount}`;
      params.push(report_type);
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

    if (vital_type) {
      paramCount++;
      query += ` AND v.vital_type = $${paramCount}`;
      params.push(vital_type);
    }

    query += ' ORDER BY r.report_date DESC, r.created_at DESC';

    const result = await pool.query(query, params);

    // Fetch vitals for each report
    const reports = await Promise.all(
      result.rows.map(async (report) => {
        const vitalsResult = await pool.query(
          'SELECT * FROM vitals WHERE report_id = $1',
          [report.id]
        );
        return {
          ...report,
          vitals: vitalsResult.rows
        };
      })
    );

    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single report by ID
exports.getReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.userId;

    // Check if user owns the report or has shared access
    const accessCheck = await pool.query(
      `SELECT r.* FROM reports r
       WHERE r.id = $1 AND (
         r.user_id = $2 OR
         EXISTS (
           SELECT 1 FROM shared_access sa
           WHERE sa.report_id = r.id 
           AND sa.shared_with_email = (SELECT email FROM users WHERE id = $2)
           AND (sa.expires_at IS NULL OR sa.expires_at > CURRENT_TIMESTAMP)
         )
       )`,
      [reportId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or access denied' });
    }

    const report = await getReportById(reportId);
    res.json({ report });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Download report file
exports.downloadReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.userId;

    // Check access
    const result = await pool.query(
      `SELECT r.* FROM reports r
       WHERE r.id = $1 AND (
         r.user_id = $2 OR
         EXISTS (
           SELECT 1 FROM shared_access sa
           WHERE sa.report_id = r.id 
           AND sa.shared_with_email = (SELECT email FROM users WHERE id = $2)
           AND (sa.expires_at IS NULL OR sa.expires_at > CURRENT_TIMESTAMP)
         )
       )`,
      [reportId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or access denied' });
    }

    const report = result.rows[0];
    const filePath = path.resolve(report.file_path);

    res.download(filePath, report.file_name);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.userId;

    // Check ownership
    const result = await pool.query(
      'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
      [reportId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or access denied' });
    }

    const report = result.rows[0];

    // Delete file
    await fs.unlink(report.file_path).catch(console.error);

    // Delete from database (cascade will delete vitals and shared_access)
    await pool.query('DELETE FROM reports WHERE id = $1', [reportId]);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Share report with others
exports.shareReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.userId;
    const { shared_with_email, shared_with_name, access_type, expires_at } = req.body;

    // Check ownership
    const reportCheck = await pool.query(
      'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
      [reportId, userId]
    );

    if (reportCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or access denied' });
    }

    // Check if already shared
    const existingShare = await pool.query(
      'SELECT * FROM shared_access WHERE report_id = $1 AND shared_with_email = $2',
      [reportId, shared_with_email]
    );

    if (existingShare.rows.length > 0) {
      return res.status(400).json({ error: 'Report already shared with this user' });
    }

    // Create shared access
    const result = await pool.query(
      `INSERT INTO shared_access (report_id, shared_by, shared_with_email, shared_with_name, access_type, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [reportId, userId, shared_with_email, shared_with_name, access_type || 'viewer', expires_at]
    );

    res.status(201).json({
      message: 'Report shared successfully',
      shared_access: result.rows[0]
    });
  } catch (error) {
    console.error('Share report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get shared reports (reports shared with current user)
exports.getSharedReports = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const result = await pool.query(
      `SELECT r.*, sa.shared_by, sa.access_type, sa.expires_at,
              u.full_name as owner_name, u.email as owner_email
       FROM reports r
       INNER JOIN shared_access sa ON r.id = sa.report_id
       INNER JOIN users u ON r.user_id = u.id
       WHERE sa.shared_with_email = $1
       AND (sa.expires_at IS NULL OR sa.expires_at > CURRENT_TIMESTAMP)
       ORDER BY r.report_date DESC`,
      [userEmail]
    );

    // Fetch vitals for each report
    const reports = await Promise.all(
      result.rows.map(async (report) => {
        const vitalsResult = await pool.query(
          'SELECT * FROM vitals WHERE report_id = $1',
          [report.id]
        );
        return {
          ...report,
          vitals: vitalsResult.rows
        };
      })
    );

    res.json({ reports });
  } catch (error) {
    console.error('Get shared reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Revoke shared access
exports.revokeAccess = async (req, res) => {
  try {
    const accessId = req.params.id;
    const userId = req.user.userId;

    // Check if user is the owner
    const result = await pool.query(
      `DELETE FROM shared_access 
       WHERE id = $1 AND shared_by = $2
       RETURNING *`,
      [accessId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shared access not found or access denied' });
    }

    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to get complete report with vitals
async function getReportById(reportId) {
  const reportResult = await pool.query('SELECT * FROM reports WHERE id = $1', [reportId]);
  const vitalsResult = await pool.query('SELECT * FROM vitals WHERE report_id = $1', [reportId]);
  
  return {
    ...reportResult.rows[0],
    vitals: vitalsResult.rows
  };
}
