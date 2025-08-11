// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      const decoded = JSON.parse(atob(res.data.token.split('.')[1]));
      const role = decoded.role;
      if (role === 'DOCTOR') navigate('/doctor');
      else if (role === 'PATIENT') navigate('/patient');
      else alert('Admin panel not yet built');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <input className="login-input" name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <input className="login-input" name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password" />
      <button className="login-btn" onClick={login}>Login</button>
    </div>
  );
}
