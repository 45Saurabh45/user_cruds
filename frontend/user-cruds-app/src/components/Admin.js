import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [updateName, setUpdateName] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/allUser`, {
          headers: {
            token: `Bearer ${token}`
          }
        });
        setUsers(response.data.users); 
      } catch (error) {
        setMessage('Error fetching users');
      }
    };

    fetchUsers();
  }, [token]);

  const handleUpdate = async () => {
    try {
      await axios.post(`${apiUrl}/api/updateUserByEmail`, 
        { email: selectedEmail, newEmail, name: updateName }, 
        { headers: { token: `Bearer ${token}` } }
      );
      setMessage('User updated successfully');
      setSelectedEmail('');
      setNewEmail('');
      setUpdateName('');
      await fetchUsers(); // Refresh the user list
    } catch (error) {
      setMessage('Error updating user');
    }
  };

  const handleDelete = async (email) => {
    try {
      await axios.delete(`${apiUrl}/api/deleteUserByEmail`, {
        headers: { token: `Bearer ${token}` },
        data: { email }
      });
      setMessage('User deleted successfully');
      await fetchUsers(); // Refresh the user list
    } catch (error) {
      setMessage('Error deleting user');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/allUser`, {
        headers: {
          token: `Bearer ${token}`
        }
      });
      setUsers(response.data.users); 
    } catch (error) {
      setMessage('Error fetching users');
    }
  };

  return (
    <div className="admin-users-container">
      <h2>Manage Users</h2>
      {message && <p className="message">{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.email}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => setSelectedEmail(user.email)}>Update</button>
                <button onClick={() => handleDelete(user.email)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedEmail && (
        <div className="update-form">
          <h3>Update User</h3>
          <input
            type="text"
            placeholder="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="New Name"
            value={updateName}
            onChange={(e) => setUpdateName(e.target.value)}
          />
          <button onClick={handleUpdate}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default Admin;
