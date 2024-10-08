import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ResetPassword.css';

const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem('accessToken');

const ResetPassword = () => {
  const [resetToken, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(''); // State for handling success or error messages

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'resetToken') {
      setToken(value);
    } else if (name === 'newPassword') {
      setNewPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/resetPassword`, { resetToken, newPassword },
        {
          headers: {
            token: `Bearer ${token}`
          }
    });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="resetToken"
          placeholder="Enter Token"
          value={resetToken}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="newPassword"
          placeholder="Enter New Password"
          value={newPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Reset Password</button>
        {message && <p className="message">{message}</p>} {/* Display success or error message */}
      </form>
    </div>
  );
};

export default ResetPassword;
