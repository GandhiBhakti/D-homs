const db = require("../config/database");

// Get OPD collection report
exports.getOPDCollectionReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'MTD' } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "WHERE DATE(b.bill_date) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (period === 'MTD') {
      dateFilter = "WHERE MONTH(b.bill_date) = MONTH(CURDATE()) AND YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "WHERE YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "WHERE DATE(b.bill_date) = CURDATE()";
    } else if (period === 'WTD') {
      dateFilter = "WHERE WEEK(b.bill_date) = WEEK(CURDATE()) AND YEAR(b.bill_date) = YEAR(CURDATE())";
    }

    const [rows] = await db.execute(`
      SELECT 
        DATE(b.bill_date) as date,
        COUNT(*) as total_visits,
        SUM(b.total_amount) as total_amount,
        SUM(b.paid_amount) as paid_amount,
        SUM(b.discount_amount) as discount_amount,
        SUM(b.total_amount - b.paid_amount) as pending_amount
      FROM billing b
      INNER JOIN patient_visits pv ON b.patient_visit_id = pv.id
      ${dateFilter} AND pv.visit_type = 'OPD'
      GROUP BY DATE(b.bill_date)
      ORDER BY date DESC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get IPD collection report
exports.getIPDCollectionReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'MTD' } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "WHERE DATE(b.bill_date) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (period === 'MTD') {
      dateFilter = "WHERE MONTH(b.bill_date) = MONTH(CURDATE()) AND YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "WHERE YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "WHERE DATE(b.bill_date) = CURDATE()";
    } else if (period === 'WTD') {
      dateFilter = "WHERE WEEK(b.bill_date) = WEEK(CURDATE()) AND YEAR(b.bill_date) = YEAR(CURDATE())";
    }

    const [rows] = await db.execute(`
      SELECT 
        DATE(b.bill_date) as date,
        COUNT(*) as total_admissions,
        SUM(b.total_amount) as total_amount,
        SUM(b.paid_amount) as paid_amount,
        SUM(b.discount_amount) as discount_amount,
        SUM(b.advance_amount) as advance_amount,
        SUM(b.total_amount - b.paid_amount) as pending_amount
      FROM billing b
      INNER JOIN patient_visits pv ON b.patient_visit_id = pv.id
      ${dateFilter} AND pv.visit_type = 'IPD'
      GROUP BY DATE(b.bill_date)
      ORDER BY date DESC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get billing report
exports.getBillingReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'MTD', payment_mode } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "WHERE DATE(b.bill_date) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (period === 'MTD') {
      dateFilter = "WHERE MONTH(b.bill_date) = MONTH(CURDATE()) AND YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "WHERE YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "WHERE DATE(b.bill_date) = CURDATE()";
    }

    let query = `
      SELECT 
        DATE(b.bill_date) as date,
        b.payment_mode,
        COUNT(*) as total_bills,
        SUM(b.total_amount) as total_amount,
        SUM(b.paid_amount) as paid_amount,
        SUM(b.discount_amount) as discount_amount,
        SUM(b.refund_amount) as refund_amount
      FROM billing b
      ${dateFilter}
    `;

    if (payment_mode) {
      query += " AND b.payment_mode = ?";
      params.push(payment_mode);
    }

    query += " GROUP BY DATE(b.bill_date), b.payment_mode ORDER BY date DESC";

    const [rows] = await db.execute(query, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get credit report
exports.getCreditReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'MTD' } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "WHERE DATE(b.bill_date) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (period === 'MTD') {
      dateFilter = "WHERE MONTH(b.bill_date) = MONTH(CURDATE()) AND YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "WHERE YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "WHERE DATE(b.bill_date) = CURDATE()";
    }

    const [rows] = await db.execute(`
      SELECT 
        b.id,
        b.bill_date,
        b.total_amount,
        b.paid_amount,
        b.discount_amount,
        (b.total_amount - b.paid_amount) as pending_amount,
        p.first_name,
        p.last_name,
        p.phone,
        pv.visit_type
      FROM billing b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN patient_visits pv ON b.patient_visit_id = pv.id
      ${dateFilter} AND b.status IN ('pending', 'partial')
      ORDER BY b.bill_date DESC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get advance payment report
exports.getAdvanceReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'MTD' } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "WHERE DATE(b.bill_date) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (period === 'MTD') {
      dateFilter = "WHERE MONTH(b.bill_date) = MONTH(CURDATE()) AND YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "WHERE YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "WHERE DATE(b.bill_date) = CURDATE()";
    }

    const [rows] = await db.execute(`
      SELECT 
        DATE(b.bill_date) as date,
        COUNT(*) as total_advances,
        SUM(b.advance_amount) as total_advance,
        p.first_name,
        p.last_name,
        p.phone
      FROM billing b
      LEFT JOIN patients p ON b.patient_id = p.id
      ${dateFilter} AND b.advance_amount > 0
      GROUP BY DATE(b.bill_date), p.first_name, p.last_name, p.phone
      ORDER BY date DESC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get discount report
exports.getDiscountReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'MTD' } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "WHERE DATE(b.bill_date) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (period === 'MTD') {
      dateFilter = "WHERE MONTH(b.bill_date) = MONTH(CURDATE()) AND YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "WHERE YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "WHERE DATE(b.bill_date) = CURDATE()";
    }

    const [rows] = await db.execute(`
      SELECT 
        DATE(b.bill_date) as date,
        COUNT(*) as total_discounts,
        SUM(b.discount_amount) as total_discount,
        AVG(b.discount_amount) as avg_discount,
        p.first_name,
        p.last_name,
        pv.visit_type
      FROM billing b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN patient_visits pv ON b.patient_visit_id = pv.id
      ${dateFilter} AND b.discount_amount > 0
      GROUP BY DATE(b.bill_date), p.first_name, p.last_name, pv.visit_type
      ORDER BY date DESC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get PMJAY collection report
exports.getPMJAYReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'MTD' } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "WHERE DATE(pv.visit_date) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (period === 'MTD') {
      dateFilter = "WHERE MONTH(pv.visit_date) = MONTH(CURDATE()) AND YEAR(pv.visit_date) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "WHERE YEAR(pv.visit_date) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "WHERE DATE(pv.visit_date) = CURDATE()";
    }

    const [rows] = await db.execute(`
      SELECT 
        DATE(pv.visit_date) as date,
        COUNT(*) as total_pmjay_patients,
        SUM(b.total_amount) as total_amount,
        SUM(b.paid_amount) as paid_amount,
        p.first_name,
        p.last_name,
        p.phone
      FROM patient_visits pv
      LEFT JOIN patients p ON pv.patient_id = p.id
      LEFT JOIN billing b ON pv.id = b.patient_visit_id
      ${dateFilter} AND pv.is_pmjay = 1
      GROUP BY DATE(pv.visit_date), p.first_name, p.last_name, p.phone
      ORDER BY date DESC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor commission report
exports.getCommissionReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'MTD', doctor_id } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "AND DATE(b.bill_date) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (period === 'MTD') {
      dateFilter = "AND MONTH(b.bill_date) = MONTH(CURDATE()) AND YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "AND YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "AND DATE(b.bill_date) = CURDATE()";
    }

    let doctorFilter = "";
    if (doctor_id) {
      doctorFilter = "AND dr.id = ?";
      params.push(doctor_id);
    }

    const [rows] = await db.execute(`
      SELECT 
        dr.id as doctor_id,
        CONCAT(dr.first_name, ' ', dr.last_name) as doctor_name,
        dr.specialization,
        COUNT(DISTINCT b.id) as total_bills,
        COALESCE(SUM(b.total_amount), 0) as total_revenue,
        COALESCE(SUM(b.paid_amount), 0) as collected_revenue,
        COALESCE(SUM(b.total_amount - b.paid_amount), 0) as pending_revenue
      FROM doctors dr
      LEFT JOIN patient_visits pv ON dr.id = pv.doctor_id
      LEFT JOIN billing b ON pv.id = b.patient_visit_id ${dateFilter}
      WHERE 1=1 ${doctorFilter}
      GROUP BY dr.id, dr.first_name, dr.last_name, dr.specialization
      ORDER BY total_revenue DESC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get patient income report
exports.getPatientIncomeReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'MTD' } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "WHERE DATE(b.bill_date) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (period === 'MTD') {
      dateFilter = "WHERE MONTH(b.bill_date) = MONTH(CURDATE()) AND YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "WHERE YEAR(b.bill_date) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "WHERE DATE(b.bill_date) = CURDATE()";
    }

    const [rows] = await db.execute(`
      SELECT 
        p.id as patient_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.phone,
        COUNT(b.id) as total_visits,
        SUM(b.total_amount) as total_amount,
        SUM(b.paid_amount) as paid_amount,
        SUM(b.discount_amount) as discount_amount,
        SUM(b.advance_amount) as advance_amount,
        (SUM(b.total_amount) - SUM(b.paid_amount)) as pending_amount
      FROM patients p
      LEFT JOIN billing b ON p.id = b.patient_id
      ${dateFilter}
      GROUP BY p.id, p.first_name, p.last_name, p.phone
      ORDER BY total_amount DESC
      LIMIT 100
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bed occupancy report
exports.getBedOccupancyReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'MTD' } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "WHERE DATE(pv.admission_date_time) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (period === 'MTD') {
      dateFilter = "WHERE MONTH(pv.admission_date_time) = MONTH(CURDATE()) AND YEAR(pv.admission_date_time) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "WHERE YEAR(pv.admission_date_time) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "WHERE DATE(pv.admission_date_time) = CURDATE()";
    }

    const [rows] = await db.execute(`
      SELECT 
        pv.ward,
        pv.room,
        pv.bed,
        pv.floor,
        COUNT(*) as total_admissions,
        COUNT(CASE WHEN pv.status = 'discharged' THEN 1 END) as discharged,
        COUNT(CASE WHEN pv.status = 'active' THEN 1 END) as currently_occupied
      FROM patient_visits pv
      ${dateFilter} AND pv.visit_type = 'IPD'
      GROUP BY pv.ward, pv.room, pv.bed, pv.floor
      ORDER BY pv.ward, pv.room, pv.bed
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get admissions/discharges report
exports.getAdmissionsDischargesReport = async (req, res) => {
  try {
    const { start_date, end_date, period = 'MTD' } = req.query;
    
    let dateFilter = "";
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = "WHERE DATE(pv.admission_date_time) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (period === 'MTD') {
      dateFilter = "WHERE MONTH(pv.admission_date_time) = MONTH(CURDATE()) AND YEAR(pv.admission_date_time) = YEAR(CURDATE())";
    } else if (period === 'YTD') {
      dateFilter = "WHERE YEAR(pv.admission_date_time) = YEAR(CURDATE())";
    } else if (period === 'TODAY') {
      dateFilter = "WHERE DATE(pv.admission_date_time) = CURDATE()";
    }

    const [rows] = await db.execute(`
      SELECT 
        DATE(pv.admission_date_time) as date,
        COUNT(*) as total_admissions,
        COUNT(CASE WHEN pv.status = 'discharged' THEN 1 END) as total_discharges,
        COUNT(CASE WHEN pv.status = 'active' THEN 1 END) as current_admissions,
        pv.ward,
        pv.department_id
      FROM patient_visits pv
      ${dateFilter} AND pv.visit_type = 'IPD'
      GROUP BY DATE(pv.admission_date_time), pv.ward, pv.department_id
      ORDER BY date DESC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get comprehensive dashboard report
exports.getDashboardReport = async (req, res) => {
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

    const [opd] = await db.execute(`
      SELECT COUNT(*) as count, SUM(total_amount) as amount
      FROM billing b
      INNER JOIN patient_visits pv ON b.patient_visit_id = pv.id
      ${dateFilter} AND pv.visit_type = 'OPD'
    `);

    const [ipd] = await db.execute(`
      SELECT COUNT(*) as count, SUM(total_amount) as amount
      FROM billing b
      INNER JOIN patient_visits pv ON b.patient_visit_id = pv.id
      ${dateFilter} AND pv.visit_type = 'IPD'
    `);

    const [credit] = await db.execute(`
      SELECT COUNT(*) as count, SUM(total_amount - paid_amount) as amount
      FROM billing
      ${dateFilter} AND status IN ('pending', 'partial')
    `);

    const [advance] = await db.execute(`
      SELECT COUNT(*) as count, SUM(advance_amount) as amount
      FROM billing
      ${dateFilter} AND advance_amount > 0
    `);

    const [discount] = await db.execute(`
      SELECT COUNT(*) as count, SUM(discount_amount) as amount
      FROM billing
      ${dateFilter} AND discount_amount > 0
    `);

    const [pmjay] = await db.execute(`
      SELECT COUNT(*) as count, SUM(b.total_amount) as amount
      FROM patient_visits pv
      LEFT JOIN billing b ON pv.id = b.patient_visit_id
      ${dateFilter.replace('bill_date', 'pv.visit_date')} AND pv.is_pmjay = 1
    `);

    res.json({
      opd: opd[0],
      ipd: ipd[0],
      credit: credit[0],
      advance: advance[0],
      discount: discount[0],
      pmjay: pmjay[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
