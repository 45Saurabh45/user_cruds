import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ResetPassword.css'
const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');

  const handleChange = (e) => {
    if (e.target.name === 'password') {
      setPassword(e.target.value);
    } else {
      setCPassword(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== cPassword) {
      alert("Passwords don't match");
      return;
    }
    try {
      const response = await axios.post('/api/reset-password', { password, token });
      alert(response.data.success);
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="cPassword"
          placeholder="Confirm New Password"
          value={cPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
