import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from '../src/components/signup';
import SignIn from '../src/components/signin';
import ForgotPassword from '../src/components/forgotpassword';
import ResetPassword from '../src/components/resetPassword';

const App = () => {
  return (
    <Router>
       <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
};

export default App;
