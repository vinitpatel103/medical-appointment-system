// src/components/PatientAppointmentsList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientAppointmentsList.css';

function PatientAppointmentsList({ token }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await axios.get(
          'http://localhost:5000/api/appointment/patient',
          { headers: { Authorization: token } }
        );
        setAppointments(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch appointments:", err);
      }
    }
    if (token) fetchAppointments();
  }, [token]);

  return (
    <div className="patientappt-container">
      <h3 className="patientappt-title">Your Appointments</h3>
      {appointments.length > 0 ? (
        <table className="patientappt-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Doctor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(app => (
              <tr key={app.ID}>
                <td>{new Date(app.DATE_BOOKED).toLocaleDateString()}</td>
                <td>{app.TIME_SLOT}</td>
                <td>{app.DOCTOR_NAME}</td>
                <td className={`status-${app.STATUS.toLowerCase()}`}>{app.STATUS}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="patientappt-empty">No appointments booked yet.</p>
      )}
    </div>
  );
}

export default PatientAppointmentsList;
