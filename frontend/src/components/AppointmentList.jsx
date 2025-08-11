// src/components/AppointmentList.jsx
import React from 'react';
import './AppointmentList.css';

export default function AppointmentList({ appointments, onAccept, onReject }) {
  if (!appointments || appointments.length === 0) {
    return <p className="appointmentlist-empty">No appointments found.</p>;
  }

  return (
    <div className="appointmentlist-container">
      <h3 className="appointmentlist-title">Appointments</h3>
      <ul className="appointmentlist-ul">
        {appointments.map(app => (
          <li className="appointmentlist-item" key={app.ID}>
            <span>📅 {app.DATE_BOOKED}</span>
            <span>⏰ {app.TIME_SLOT}</span>
            <span>👤 {app.PATIENT_NAME}</span>
            <span className={`appointmentlist-status status-${app.STATUS.toLowerCase()}`}>
              {app.STATUS}
            </span>
            {app.STATUS === 'Pending' && (
              <div className="appointmentlist-actions">
                <button
                  className="btn-accept"
                  onClick={() => onAccept(app.ID)}
                >
                  Accept
                </button>
                <button
                  className="btn-reject"
                  onClick={() => onReject(app.ID)}
                >
                  Reject
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
