import React from 'react';
import './AppointmentRequestForm.css';

export default function AppointmentRequestForm({
  selectedDoctor,
  form,
  handleChange,
  handleSubmit,
  onCancel
}) {
  return (
    <form className="arf-form" onSubmit={handleSubmit}>
      <h3 className="arf-title">
        Request Appointment with Doctor ID: {selectedDoctor}
      </h3>

      <label className="arf-label">
        Date:
        <input
          className="arf-input"
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
      </label>

      <label className="arf-label">
        Time:
        <input
          className="arf-input"
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          required
        />
      </label>

      <div className="arf-buttons">
        <button className="arf-btn arf-submit" type="submit">
          Send Request
        </button>
        <button
          className="arf-btn arf-cancel"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
