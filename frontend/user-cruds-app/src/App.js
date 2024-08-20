import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from '../src/components/signup';
import SignIn from '../src/components/signin';
import ForgotPassword from '../src/components/forgotpassword';
import ResetPassword from '../src/components/resetPassword';
import Admin from '../src/components/Admin'; // Import AdminUsers component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={<Admin />} /> {/* Add route for AdminUsers */}
      </Routes>
    </Router>
  );
};

export default App;
