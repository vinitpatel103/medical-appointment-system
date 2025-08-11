import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppointmentRequestForm from '../components/AppointmentRequestForm';
import PatientAppointmentsList from '../components/PatientAppointmentsList';
import './PatientDashboard.css';

function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({ date: '', time: '' });

  const token = localStorage.getItem('token');
  console.log("📦 Token from localStorage:", token);

  // Decode JWT to get patient name
  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log("🔓 Decoded token:", decoded);
        setPatientName(decoded.name || decoded.email);
      } catch (err) {
        console.error("❌ Token decode error:", err);
      }
    }
  }, [token]);

  // Fetch doctors list
  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/doctors', {
          headers: { Authorization: token }
        });
        console.log('✅ Doctors fetched:', res.data);
        setDoctors(res.data);
      } catch (err) {
        alert('Failed to fetch doctors: ' + (err.response?.data?.error || err.message));
      }
    }
    if (token) {
      fetchDoctors();
    }
  }, [token]);

  const handleRequestClick = (doctorId) => {
    console.log("👨‍⚕️ Doctor selected for appointment:", doctorId);
    setSelectedDoctor(doctorId);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctor || !form.date || !form.time) {
      alert("Please select doctor, date, and time.");
      return;
    }

    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(form.date);
    if (!isValidDate) {
      alert("Invalid date format. Please use YYYY-MM-DD.");
      return;
    }

    console.log("📤 Sending appointment request with:", {
      doctorId: selectedDoctor,
      date: form.date,
      time: form.time
    });

    try {
      await axios.post(
        'http://localhost:5000/api/appointment/request',
        {
          doctorId: selectedDoctor,
          date: form.date,
          time: form.time
        },
        {
          headers: { Authorization: token }
        }
      );
      alert('✅ Appointment request sent!');
      setShowForm(false);
      setForm({ date: '', time: '' });
      setSelectedDoctor(null);
    } catch (err) {
      console.error("❌ Request failed:", err);
      alert('Request failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="patient-dashboard">
      <h2 className="dashboard-title">Patient Dashboard</h2>
      <p className="patient-welcome">Welcome, {patientName}</p>

      <h3 className="section-title">Available Doctors</h3>
      <ul className="doctor-list">
        {doctors.map(doc => (
          <li key={doc.ID} className="doctor-item">
            <strong className="doctor-name">{doc.NAME}</strong>
            <button 
              className="request-btn" 
              onClick={() => handleRequestClick(doc.ID)}
            >
              Request Appointment
            </button>
          </li>
        ))}
      </ul>

      <PatientAppointmentsList token={token} />

      {showForm && (
        <AppointmentRequestForm
          selectedDoctor={selectedDoctor}
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default PatientDashboard;
