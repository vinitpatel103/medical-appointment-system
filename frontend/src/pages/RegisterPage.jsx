// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'PATIENT' });
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const register = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert('Registration successful!');
      navigate('/');
    } catch (err) {
      console.log("❌ Registration error:", err);
      alert('Error registering');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      <input className="register-input" name="name" value={form.name} onChange={handleChange} placeholder="Name" />
      <input className="register-input" name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <input className="register-input" name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password" />
      <select className="register-select" name="role" value={form.role} onChange={handleChange}>
        <option value="PATIENT">Patient</option>
        <option value="DOCTOR">Doctor</option>
      </select>
      <button className="register-btn" onClick={register}>Register</button>
    </div>
  );
}
