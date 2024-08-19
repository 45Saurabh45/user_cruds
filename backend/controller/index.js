const { toTitleCase, validateEmail } = require("../config/function");
const bcrypt = require("bcryptjs");
const allmodels = require("../models/index");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const path = require("path");




exports.isAdmin = async (req, res, next) => {
    try {
      const { loggedInUserId } = req.body;
      const loggedInUserRole = await allmodels.userModel.findById(loggedInUserId);
      res.json({ role: loggedInUserRole.userRole,
        email: loggedInUserRole.email
       });
    } catch (err) {
      next(err);
    }
  };
  
  exports.allUser = async (req, res, next) => {
    try {
      const allUser = await allmodels.userModel.find({});
      res.json({ users: allUser });
    } catch (err) {
      next(err);
    }
  };
  
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
      return res.json({ error });
    }
  
    if (name.length < 3 || name.length > 25) {
      error = { ...error, name: "Name must be 3-25 characters" };
      return res.json({ error });
    }
  
    if (!validateEmail(email)) {
      error = {
        ...error,
        email: "Email is not valid",
      };
      return res.json({ error });
    }
  
    if (password.length < 8 || password.length > 255) {
      error = {
        ...error,
        password: "Password must be between 8 and 255 characters",
      };
      return res.json({ error });
    }
  
    if (password !== cPassword) {
      error = {
        ...error,
        cPassword: "Passwords do not match",
      };
      return res.json({ error });
    }
  
    try {
      const existingUser = await allmodels.userModel.findOne({ email });
      if (existingUser) {
        error = {
          ...error,
          email: "Email already exists",
        };
        return res.json({ error });
      }
  
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = new allmodels.userModel({
        name: toTitleCase(name),
        email,
        password: hashedPassword,
        userRole, // Role 1 for admin and 0 for user/customer
      });
  
      await newUser.save();
      res.json({
        success: "Account created successfully. Please login",
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.postSignin = async (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.json({
        error: "Fields must not be empty",
      });
    }
  
    try {
      const user = await allmodels.userModel.findOne({ email });
      console.log(user)
      if (!user) {
        return res.json({
          error: "Invalid email or password",
        });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.json({
          error: "Invalid email or password",
        });
      }
  
      const token = jwt.sign(
        { _id: user._id, role: user.userRole, email: user.email },
        JWT_SECRET
      );
  
      const decodedToken = jwt.verify(token, JWT_SECRET);
      res.json({
        token,
        user: decodedToken,
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
  
  // Get Single User
  exports.getSingleUser = async (req, res, next) => {
    const { uId } = req.body;
    if (!uId) {
      return res.status(400).json({ error: "User ID is required" });
    }
  
    try {
      const user = await allmodels.userModel
        .findById(uId)
        .select("name email phoneNumber userImage updatedAt createdAt");
  
      if (user) {
        res.json({ User: user });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (err) {
      next(err);
    }
  };
  
  // Add User
  exports.postAddUser = async (req, res, next) => {
    const { allProduct, user, amount, transactionId, address, phone } = req.body;
  
    if (!allProduct || !user || !amount || !transactionId || !address || !phone) {
      return res.status(400).json({ message: "All fields must be required" });
    }
  
    try {
      const newUser = new allmodels.userModel({
        allProduct,
        user,
        amount,
        transactionId,
        address,
        phone,
      });
  
      await newUser.save();
      res.json({ success: "User created successfully" });
    } catch (err) {
      next(err);
    }
  };
  
  // Edit User
  exports.postEditUser = async (req, res, next) => {
    const { uId, name, phoneNumber } = req.body;
  
    if (!uId || !name || !phoneNumber) {
      return res.status(400).json({ message: "All fields must be required" });
    }
  
    try {
      await allmodels.userModel.findByIdAndUpdate(uId, {
        name,
        phoneNumber,
        updatedAt: Date.now(),
      });
  
      res.json({ success: "User updated successfully" });
    } catch (err) {
      next(err);
    }
  };
  
  // Delete User
  exports.getDeleteUser = async (req, res, next) => {
    const { oId, status } = req.body;
  
    if (!oId || !status) {
      return res.status(400).json({ message: "All fields must be required" });
    }
  
    try {
      await allmodels.userModel.findByIdAndUpdate(oId, {
        status,
        updatedAt: Date.now(),
      });
  
      res.json({ success: "User status updated successfully" });
    } catch (err) {
      next(err);
    }
  };
  
  // Change Password
  exports.changePassword = async (req, res, next) => {
    const { uId, oldPassword, newPassword } = req.body;
  
    if (!uId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields must be required" });
    }
  
    try {
      const user = await allmodels.userModel.findById(uId);
      if (!user) {
        return res.status(404).json({ error: "Invalid user" });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }
  
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      await allmodels.userModel.findByIdAndUpdate(uId, { password: hashedPassword });
  
      res.json({ success: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  };  



  
