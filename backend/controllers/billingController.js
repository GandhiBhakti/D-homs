const db = require("../config/database");

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT b.id, b.bill_date, b.bill_type, b.total_amount, b.paid_amount, 
             b.discount_amount, b.status, b.payment_method,
             p.patient_id, p.first_name, p.last_name, p.phone,
             pv.visit_type, pv.doctor_id
      FROM billing b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN patient_visits pv ON ON b.patient_visit_id = pv.id
      ORDER BY b.bill_date DESC, b.id DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bill by ID
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(`
      SELECT b.*, 
             p.patient_id, p.first_name, p.last_name, p.phone, p.email,
             pv.visit_type, pv.department_id, pv.doctor_id,
             d.name as department_name,
             dr.first_name as doctor_first_name, dr.last_name as doctor_last_name
      FROM billing b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN patient_visits pv ON b.patient_visit_id = pv.id
      LEFT JOIN departments d ON pv.department_id = d.id
      LEFT JOIN doctors dr ON pv.doctor_id = dr.id
      WHERE b.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new bill
exports.createBill = async (req, res) => {
  try {
    const {
      patient_visit_id,
      patient_id,
      bill_date,
      bill_type,
      total_amount,
      paid_amount = 0,
      discount_amount = 0,
      payment_method,
      registration_charge = 0,
      consultation_charge = 0,
      specialist_charge = 0,
      emergency_charge = 0,
      xray_charge = 0,
      ecg_charge = 0,
      injection_charge = 0,
      plaster_charge = 0,
      other_charge = 0,
      payment_mode = 'Cash',
      transaction_id,
    } = req.body;

    if (!patient_id || !bill_date || !bill_type || !total_amount) {
      return res.status(400).json({
        error: "Patient ID, bill date, bill type, and total amount are required",
      });
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const status = paid_amount >= total_amount - discount_amount ? "paid" : 
                    paid_amount > 0 ? "partial" : "pending";

      const [result] = await connection.execute(
        `INSERT INTO billing (patient_visit_id, patient_id, bill_date, bill_type, total_amount, paid_amount, discount_amount, status, payment_method, registration_charge, consultation_charge, specialist_charge, emergency_charge, xray_charge, ecg_charge, injection_charge, plaster_charge, other_charge, payment_mode, transaction_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          patient_visit_id || null,
          patient_id,
          bill_date,
          bill_type,
          total_amount,
          paid_amount,
          discount_amount,
          status,
          payment_method || null,
          registration_charge,
          consultation_charge,
          specialist_charge,
          emergency_charge,
          xray_charge,
          ecg_charge,
          injection_charge,
          plaster_charge,
          other_charge,
          payment_mode,
          transaction_id || null,
        ]
      );

      await connection.commit();

      res.status(201).json({
        message: "Bill created successfully",
        billId: result.insertId,
        status,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update bill payment
exports.updateBillPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid_amount, payment_method } = req.body;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Get current bill details
      const [currentBill] = await connection.execute(
        'SELECT total_amount, discount_amount, paid_amount FROM billing WHERE id = ?',
        [id]
      );

      if (currentBill.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Bill not found" });
      }

      const bill = currentBill[0];
      const newPaidAmount = bill.paid_amount + paid_amount;
      const status = newPaidAmount >= bill.total_amount - bill.discount_amount ? "paid" : "partial";

      await connection.execute(
        `UPDATE billing 
         SET paid_amount = ?, 
             status = ?,
             payment_method = COALESCE(?, payment_method)
         WHERE id = ?`,
        [newPaidAmount, status, payment_method || null, id]
      );

      await connection.commit();

      res.json({
        message: "Payment updated successfully",
        newPaidAmount,
        status,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get revenue by doctor
exports.getRevenueByDoctor = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "AND b.bill_date BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (start_date) {
      dateFilter = "AND b.bill_date >= ?";
      params.push(start_date);
    } else if (end_date) {
      dateFilter = "AND b.bill_date <= ?";
      params.push(end_date);
    }

    const [rows] = await db.execute(`
      SELECT 
        dr.id as doctor_id,
        CONCAT(dr.first_name, ' ', dr.last_name) as doctor_name,
        dr.specialization,
        d.name as department_name,
        COUNT(DISTINCT pv.id) as total_visits,
        COUNT(DISTINCT b.id) as total_bills,
        COALESCE(SUM(b.total_amount), 0) as total_revenue,
        COALESCE(SUM(b.paid_amount), 0) as collected_revenue,
        COALESCE(SUM(b.total_amount - b.paid_amount), 0) as pending_revenue
      FROM doctors dr
      LEFT JOIN patient_visits pv ON dr.id = pv.doctor_id
      LEFT JOIN billing b ON pv.id = b.patient_visit_id ${dateFilter}
      LEFT JOIN departments d ON dr.department_id = d.id
      GROUP BY dr.id, dr.first_name, dr.last_name, dr.specialization, d.name
      ORDER BY total_revenue DESC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get daily revenue breakdown
exports.getDailyRevenue = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "WHERE bill_date BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else {
      // Default to last 30 days
      dateFilter = "WHERE bill_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }

    const [rows] = await db.execute(`
      SELECT 
        bill_date,
        bill_type,
        COUNT(*) as bill_count,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as paid_amount,
        COALESCE(SUM(discount_amount), 0) as discount_amount
      FROM billing
      ${dateFilter}
      GROUP BY bill_date, bill_type
      ORDER BY bill_date DESC, bill_type
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get revenue summary by type
exports.getRevenueSummary = async (req, res) => {
  try {
    const { period = 'MTD' } = req.query;
    
    let dateFilter = "";
    if (period === 'MTD') {
      dateFilter = "WHERE MONTH(bill_date) = MONTH(CURDATE()) AND YEAR(bill_date) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "WHERE YEAR(bill_date) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "WHERE DATE(bill_date) = CURDATE()";
    }

    const [rows] = await db.execute(`
      SELECT 
        bill_type,
        COUNT(*) as bill_count,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as paid_amount,
        COALESCE(SUM(discount_amount), 0) as discount_amount,
        COALESCE(SUM(total_amount - paid_amount), 0) as pending_amount
      FROM billing
      ${dateFilter}
      GROUP BY bill_type
      ORDER BY total_amount DESC
    `);

    const [total] = await db.execute(`
      SELECT 
        COUNT(*) as total_bills,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(paid_amount), 0) as total_collected,
        COALESCE(SUM(discount_amount), 0) as total_discount,
        COALESCE(SUM(total_amount - paid_amount), 0) as total_pending
      FROM billing
      ${dateFilter}
    `);

    res.json({
      byType: rows,
      summary: total[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor commission report
exports.getDoctorCommissionReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "AND b.bill_date BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else {
      // Default to current month
      dateFilter = "AND MONTH(b.bill_date) = MONTH(CURDATE()) AND YEAR(b.bill_date) = YEAR(CURDATE())";
    }

    const [rows] = await db.execute(`
      SELECT 
        dr.id as doctor_id,
        CONCAT(dr.first_name, ' ', dr.last_name) as doctor_name,
        dr.specialization,
        dc.commission_type,
        dc.commission_value,
        COUNT(DISTINCT b.id) as total_bills,
        COALESCE(SUM(b.total_amount), 0) as total_revenue,
        CASE 
          WHEN dc.commission_type = 'percentage' THEN COALESCE(SUM(b.total_amount), 0) * (dc.commission_value / 100)
          WHEN dc.commission_type = 'fixed' THEN COALESCE(SUM(b.total_amount), 0) * (dc.commission_value / 100)
          ELSE 0
        END as commission_amount
      FROM doctors dr
      LEFT JOIN doctor_commission dc ON dr.id = dc.doctor_id AND dc.is_active = 1
      LEFT JOIN patient_visits pv ON dr.id = pv.doctor_id
      LEFT JOIN billing b ON pv.id = b.patient_visit_id ${dateFilter}
      GROUP BY dr.id, dr.first_name, dr.last_name, dr.specialization, dc.commission_type, dc.commission_value
      ORDER BY commission_amount DESC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete bill (admin only)
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [result] = await connection.execute(
        'DELETE FROM billing WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Bill not found" });
      }
      
      await connection.commit();
      
      res.json({ message: "Bill deleted successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refund bill (admin only)
exports.refundBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { refund_amount, refund_type } = req.body;
    
    if (!refund_amount || refund_amount <= 0) {
      return res.status(400).json({ error: "Valid refund amount is required" });
    }
    
    if (!refund_type || !['in-house', 'out-house'].includes(refund_type)) {
      return res.status(400).json({ error: "Valid refund type (in-house or out-house) is required" });
    }
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get current bill details
      const [currentBill] = await connection.execute(
        'SELECT total_amount, paid_amount, refund_amount FROM billing WHERE id = ?',
        [id]
      );
      
      if (currentBill.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Bill not found" });
      }
      
      const bill = currentBill[0];
      const totalRefunded = (bill.refund_amount || 0) + refund_amount;
      
      if (totalRefunded > bill.paid_amount) {
        await connection.rollback();
        return res.status(400).json({ error: "Refund amount cannot exceed paid amount" });
      }
      
      await connection.execute(
        `UPDATE billing SET refund_amount = ?, refund_type = ? WHERE id = ?`,
        [totalRefunded, refund_type, id]
      );
      
      await connection.commit();
      
      res.json({
        message: "Refund processed successfully",
        refund_amount,
        total_refunded: totalRefunded
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
