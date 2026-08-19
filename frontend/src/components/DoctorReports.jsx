import React, { useState, useEffect, useCallback } from 'react';
import { prescriptionService } from '../services/prescriptionService';
import { doctorService } from '../services/doctorService';
import { useAuth } from '../contexts/AuthContext';

const DoctorReports = ({ searchQuery }) => {
    const { user, isDoctor, isAdmin } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [filterType, setFilterType] = useState('daily'); // daily, custom, all
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [groupByDate, setGroupByDate] = useState(false);

    const fetchDoctors = useCallback(async () => {
        try {
            const data = await doctorService.getAllDoctors();
            setDoctors(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch doctors:', err);
            setError('Failed to fetch doctors');
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        if (!selectedDoctor) return;
        
        try {
            setLoading(true);
            setError(null);
            const filters = {
                doctor_id: selectedDoctor
            };

            if (filterType === 'daily') {
                const today = new Date().toISOString().split('T')[0];
                filters.date_from = today;
                filters.date_to = today;
            } else if (filterType === 'custom') {
                if (dateFrom) filters.date_from = dateFrom;
                if (dateTo) filters.date_to = dateTo;
            }

            if (groupByDate) {
                filters.group_by_date = true;
            }

            console.log('Fetching stats with filters:', filters);
            const data = await prescriptionService.getDoctorStats(filters);
            console.log('Stats data:', data);
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(err.message || 'Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    }, [selectedDoctor, filterType, dateFrom, dateTo, groupByDate]);

    useEffect(() => {
        const initialize = async () => {
            await fetchDoctors();
            if (isDoctor() && user?.doctor_id) {
                setSelectedDoctor(user.doctor_id);
            } else if (isAdmin()) {
                // Auto-select first doctor for admin after doctors are loaded
                const data = await doctorService.getAllDoctors();
                if (data.length > 0) {
                    setSelectedDoctor(data[0].id);
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        initialize();
    }, [isDoctor, isAdmin, user, fetchDoctors]);

    useEffect(() => {
        if (selectedDoctor) {
            fetchStats();
        }
    }, [fetchStats, selectedDoctor]);

    const calculateTotal = (statsData) => {
        if (!statsData || statsData.length === 0) {
            return {
                total_prescriptions: 0,
                total_amount: 0,
                total_consultation_fee: 0,
                total_lab_fee: 0,
                total_xray_fee: 0,
                total_other_fee: 0
            };
        }
        
        return statsData.reduce((acc, stat) => {
            return {
                total_prescriptions: acc.total_prescriptions + (stat.total_prescriptions || 0),
                total_amount: acc.total_amount + parseFloat(stat.total_amount || 0),
                total_consultation_fee: acc.total_consultation_fee + parseFloat(stat.total_consultation_fee || 0),
                total_lab_fee: acc.total_lab_fee + parseFloat(stat.total_lab_fee || 0),
                total_xray_fee: acc.total_xray_fee + parseFloat(stat.total_xray_fee || 0),
                total_other_fee: acc.total_other_fee + parseFloat(stat.total_other_fee || 0)
            };
        }, {
            total_prescriptions: 0,
            total_amount: 0,
            total_consultation_fee: 0,
            total_lab_fee: 0,
            total_xray_fee: 0,
            total_other_fee: 0
        });
    };

    const totals = calculateTotal(stats);

    if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>Loading...</div>;
    if (error) return <div className="error" style={{ textAlign: 'center', padding: '40px', color: 'red', fontSize: '18px' }}>{error}</div>;

    return (
        <div className="doctor-reports-container" style={{ padding: '20px' }}>
            <div className="header">
                <h2>Doctor Reports & Statistics</h2>
            </div>

            {/* Filters */}
            <div className="filters" style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <div className="form-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    {isAdmin() && (
                        <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Doctor</label>
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>
                                        Dr. {doctor.first_name} {doctor.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Filter Type</label>
                        <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="daily">Today</option>
                            <option value="custom">Custom Range</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>

                    {filterType === 'custom' && (
                        <>
                            <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>From Date</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>To Date</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group" style={{ minWidth: '150px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontWeight: 'bold' }}>
                            <input
                                type="checkbox"
                                checked={groupByDate}
                                onChange={(e) => setGroupByDate(e.target.checked)}
                                style={{ width: 'auto' }}
                            />
                            Group by Date
                        </label>
                    </div>

                    <button 
                        className="btn btn-secondary" 
                        onClick={fetchStats}
                        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {stats.length > 0 && (
                <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div className="card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #007bff' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Total Prescriptions</h3>
                        <p className="value" style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{totals.total_prescriptions}</p>
                    </div>
                    <div className="card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #28a745' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Total Amount</h3>
                        <p className="value" style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#333' }}>₹{totals.total_amount.toFixed(2)}</p>
                    </div>
                    <div className="card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #17a2b8' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Consultation Fees</h3>
                        <p className="value" style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#333' }}>₹{totals.total_consultation_fee.toFixed(2)}</p>
                    </div>
                    <div className="card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #ffc107' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Lab Fees</h3>
                        <p className="value" style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#333' }}>₹{totals.total_lab_fee.toFixed(2)}</p>
                    </div>
                    <div className="card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #dc3545' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>X-Ray Fees</h3>
                        <p className="value" style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#333' }}>₹{totals.total_xray_fee.toFixed(2)}</p>
                    </div>
                    <div className="card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #6c757d' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Other Fees</h3>
                        <p className="value" style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#333' }}>₹{totals.total_other_fee.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* Detailed Table */}
            {stats.length > 0 && (
                <div className="table-container" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Detailed Breakdown</h3>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                {groupByDate && <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Date</th>}
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Prescriptions</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Total Amount (₹)</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Consultation (₹)</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Lab (₹)</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>X-Ray (₹)</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Other (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((stat, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    {groupByDate && <td style={{ padding: '12px', color: '#495057' }}>{stat.date}</td>}
                                    <td style={{ padding: '12px', color: '#495057' }}>{stat.total_prescriptions}</td>
                                    <td style={{ padding: '12px', color: '#495057', fontWeight: 'bold' }}>₹{(stat.total_amount || 0).toFixed(2)}</td>
                                    <td style={{ padding: '12px', color: '#495057' }}>₹{(stat.total_consultation_fee || 0).toFixed(2)}</td>
                                    <td style={{ padding: '12px', color: '#495057' }}>₹{(stat.total_lab_fee || 0).toFixed(2)}</td>
                                    <td style={{ padding: '12px', color: '#495057' }}>₹{(stat.total_xray_fee || 0).toFixed(2)}</td>
                                    <td style={{ padding: '12px', color: '#495057' }}>₹{(stat.total_other_fee || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {stats.length === 0 && selectedDoctor && (
                <div className="no-data" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
                    <p style={{ fontSize: '18px', color: '#666', margin: '0' }}>No data found for the selected filters.</p>
                    <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>Try changing the filter type or date range.</p>
                </div>
            )}
        </div>
    );
};

export default DoctorReports;
