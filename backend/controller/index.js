const { toTitleCase, validateEmail } = require("../config/function");
const bcrypt = require("bcryptjs");
const allmodels = require("../models/index");
const {User} = require("../models")
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;


  exports.postSignup = async (req, res, next) => {
    const { name, email, password, cPassword, userRole } = req.body;
    let error = {};
  
    if (!name || !email || !password || !cPassword) {
      error = {
        ...error,
        name: "Field must not be empty",
        email: "Field must not be empty",
        password: "Field must not be empty",
        cPassword: "Field must not be empty",
      };
      return res.status(400).json({ error });
    }
  
    if (name.length < 3 || name.length > 25) {
      error = { ...error, name: "Name must be 3-25 characters" };
      return res.status(400).json({ error });
    }
  
    if (!validateEmail(email)) {
      error = {
        ...error,
        email: "Email is not valid",
      };
      return res.status(400).json({ error });
    }
  
    if (password.length < 8 || password.length > 255) {
      error = {
        ...error,
        password: "Password must be between 8 and 255 characters",
      };
      return res.status(400).json({ error });
    }
  
    if (password !== cPassword) {
      error = {
        ...error,
        cPassword: "Passwords do not match",
      };
      return res.status(400).json({ error });
    }
  
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        error = {
          ...error,
          email: "Email already exists",
        };
        return res.status(400).json({ error });
      }
  
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = await User.create({
        name: toTitleCase(name),
        email,
        password: hashedPassword,
        userRole,
      });
  
      res.status(201).json({
        success: "Account created successfully. Please login",
      });
    } catch (err) {
      console.log("error",err)
      next(err);
    }
  };
  
  exports.postSignin = async (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({
        error: "Fields must not be empty",
      });
    }
  
    try {
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }
  
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role:user.userRole},
        JWT_SECRET,
        { expiresIn: '15m' }
      );
  
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email, role: user.userRole },
        JWT_REFRESH_SECRET,
        { expiresIn: '1d' } 
      );
  
      await user.update({ refreshToken });
  
      res.json({
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, role: user.userRole },
      });
    } catch (err) {
      console.log(err)
      next(err);
    }
  };
  
  exports.refreshToken = async (req, res, next) => {
    const { refreshToken } = req.body;
  
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }
  
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  
      const user = await User.findOne({ where: { id: decoded.id } });
  
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ error: "Invalid refresh token" });
      }
  
      const accessToken = jwt.sign(
        { id: user.id, role: user.userRole, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' } 
      );
  
      res.json({
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.getAllUser = async (req, res, next) => {
    try {
      const users = await allmodels.userModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      
      res.json({ Users: users });
    } catch (err) {
      next(err);
    }
  };
  
 
  exports.changePassword = async (req, res, next) => {
    const { email, oldPassword, newPassword } = req.body;
  
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });
  
      res.json({ success: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  }; 

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  

  exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; 
  
      await user.update({
        resetToken,
        resetTokenExpiry
      });
  
      const message = `You requested a password reset. This your Token for changing your password ${resetToken}`;
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: message
      });
  
      res.json({ message: "Password reset email sent" });
    } catch (err) {
      next(err);
    }
  };
  
  exports.resetPassword = async (req, res, next) => {
    const { token, newPassword } = req.body;
  
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
  
    try {
      const user = await User.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            [Op.gt]: Date.now()
          }
        }
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      });
  
      res.json({ message: "Password has been reset successfully" });
    } catch (err) {
      next(err);
    }
  };

  exports.updateUserByEmail = async (req, res, next) => {
    const { email, newEmail, name, userRole } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: "Current email is required" });
    }
  
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      if (newEmail) user.email = newEmail;
      if (name) user.name = name;
      if (userRole !== undefined) user.userRole = userRole; 
  
      await user.save();
  
      res.json({ message: "User details updated successfully", user });
    } catch (err) {
      next(err); 
    }
  };

  exports.deleteUserByEmail = async (req, res, next) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
  
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      await user.destroy();
  
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      next(err); 
    }
  };

  exports.allUser = async (req, res, next) => {
    try {
      const allUser = await User.findAll({
      });
      res.json({ users: allUser });
    } catch (err) {
      next(err);
    }
  };
    

  
