import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { scheduleService } from "../services/scheduleService";
import { doctorService } from "../services/doctorService";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "./PageHeader";

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const { user, isDoctor, logout } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesData, doctorsData] = await Promise.all([
        scheduleService.getAllSchedules(),
        doctorService.getAllDoctors(),
      ]);
      setSchedules(schedulesData);
      setDoctors(doctorsData);

      // Get current doctor's ID if user is a doctor
      if (isDoctor()) {
        const currentDoctor = doctorsData.find(doc => doc.user_id === user?.id);
        setCurrentDoctorId(currentDoctor?.id || null);
      }
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentSchedule(null);
    setShowModal(true);
  };

  const handleEdit = (schedule) => {
    setCurrentSchedule(schedule);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await scheduleService.deleteSchedule(id);
        fetchData();
      } catch (err) {
        setError("Failed to delete schedule");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleToggleStatus = async (schedule) => {
    try {
      const updatedSchedule = { ...schedule, is_active: !schedule.is_active };
      await scheduleService.updateSchedule(schedule.id, updatedSchedule);
      fetchData();
    } catch (err) {
      setError("Failed to update schedule status");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="schedule-container">
      <PageHeader title="Doctor Schedule" onLogout={handleLogout} />
      <div className="header">
        <h2>{isDoctor() ? "My Schedule" : "Doctor Schedule"}</h2>
        {!isDoctor() && (
          <button className="btn btn-primary" onClick={handleAdd}>
            Add Schedule
          </button>
        )}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            {!isDoctor() && <th>Doctor</th>}
            <th>Day</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Max Patients</th>
            <th>Status</th>
            {!isDoctor() && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => {
            // If user is a doctor, only show their own schedule
            if (isDoctor() && schedule.doctor_id !== currentDoctorId) {
              return null;
            }
            return (
            <tr key={schedule.id}>
              <td>{schedule.id}</td>
              {!isDoctor() && (
                <td>
                  {schedule.first_name} {schedule.last_name}
                </td>
              )}
              <td>{schedule.day_of_week}</td>
              <td>{schedule.start_time}</td>
              <td>{schedule.end_time}</td>
              <td>{schedule.max_patients}</td>
              <td>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={schedule.is_active}
                    onChange={() => handleToggleStatus(schedule)}
                  />
                  <span className="slider"></span>
                  <span className={`status-text ${schedule.is_active ? "active" : "inactive"}`}>
                    {schedule.is_active ? "Active" : "Inactive"}
                  </span>
                </label>
              </td>
              {!isDoctor() && (
                <td>
                  <button
                    className="btn btn-sm btn-edit"
                    onClick={() => handleEdit(schedule)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => handleDelete(schedule.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
            );
          })}
        </tbody>
      </table>

      {showModal && (
        <ScheduleModal
          schedule={currentSchedule}
          doctors={doctors}
          onClose={() => setShowModal(false)}
          onSave={fetchData}
        />
      )}
    </div>
  );
};

const ScheduleModal = ({ schedule, doctors, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    schedule || {
      doctor_id: "",
      day_of_week: "Monday",
      start_time: "",
      end_time: "",
      max_patients: 20,
      is_active: true,
    },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (schedule) {
        await scheduleService.updateSchedule(schedule.id, formData);
      } else {
        await scheduleService.createSchedule(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      alert("Failed to save schedule");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{schedule ? "Edit Schedule" : "Add Schedule"}</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Doctor</label>
            <select
              value={formData.doctor_id}
              onChange={(e) =>
                setFormData({ ...formData, doctor_id: e.target.value })
              }
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Day of Week</label>
            <select
              value={formData.day_of_week}
              onChange={(e) =>
                setFormData({ ...formData, day_of_week: e.target.value })
              }
              required
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Max Patients</label>
            <input
              type="number"
              value={formData.max_patients}
              onChange={(e) =>
                setFormData({ ...formData, max_patients: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
              Active
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorSchedule;
