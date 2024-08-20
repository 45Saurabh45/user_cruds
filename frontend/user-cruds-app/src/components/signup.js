import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css';

const apiUrl = process.env.REACT_APP_API_URL;
console.log(apiUrl)
const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cPassword: '',
    userRole: ''
  });

  const [message, setMessage] = useState(''); // State to manage success or error message

  const handleChange = (e) => {
    // Update formData based on the input type
    if (e.target.name === 'userRole') {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(apiUrl)
      const response = await axios.post(`${apiUrl}/api/signup`, formData);
      
      // Check if response status is 200 or success and set the success message
      if (response.status === 200 || response.status === 201) {
        setMessage('Sign up successful!'); // Set the success message
      } else {
        setMessage('An unexpected error occurred.'); // Handle other responses
      }
    } catch (error) {
      setMessage('An error occurred while signing up.'); // Handle error response
    }
  };

  return (
    <div className="sign-up-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="cPassword"
          placeholder="Confirm Password"
          value={formData.cPassword}
          onChange={handleChange}
          required
        />
        <div className="radio-buttons">
          <label>
            <input
              type="radio"
              name="userRole"
              value="Admin"
              checked={formData.userRole === 'Admin'}
              onChange={handleChange}
            />
            Admin
          </label>
          <label>
            <input
              type="radio"
              name="userRole"
              value="User"
              checked={formData.userRole === 'User'}
              onChange={handleChange}
            />
            User
          </label>
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {message && <p className="message">{message}</p>} {/* Render the success or error message */}
    </div>
  );
};

export default SignUp;
