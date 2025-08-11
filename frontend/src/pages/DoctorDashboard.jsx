import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppointmentList from '../components/AppointmentList';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem('token');

  // Fetch appointments for logged-in doctor
  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await axios.get('http://localhost:5000/api/appointment/mydoctorappointments', {
          headers: { Authorization: token }
        });
        console.log("✅ Appointments fetched:", res.data); // 👀 Debug log
        setAppointments(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch appointments:", err);
        alert('Error loading appointments.');
      }
    }

    if (token) fetchAppointments();
  }, [token]);

  const acceptAppointment = async (id) => {
    try {
      await axios.post('http://localhost:5000/api/appointment/accept', { appointmentId: id }, {
        headers: { Authorization: token }
      });
      alert('Appointment accepted!');
      window.location.reload(); // reload to update list
    } catch (err) {
      alert('Accept failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const rejectAppointment = async (id) => {
    try {
      await axios.post('http://localhost:5000/api/appointment/reject', { appointmentId: id }, {
        headers: { Authorization: token }
      });
      alert('Appointment rejected!');
      window.location.reload(); // reload to update list
    } catch (err) {
      alert('Reject failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <h2>Doctor Dashboard</h2>
      <AppointmentList
        appointments={appointments}
        onAccept={acceptAppointment}
        onReject={rejectAppointment}
      />
    </div>
  );
}
