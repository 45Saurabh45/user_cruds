const controller = require('../controller');
const {loginCheck, checkAdmin} = require("../middleware/auth");
const multer = require("multer");

const basePath = '/api';


module.exports = app => {
    //For signin page
    app.post(`${basePath}/signup`, controller.postSignup); 
    app.post(`${basePath}/signin`, controller.postSignin); 
    app.get(`${basePath}/allUser`,loginCheck,checkAdmin, controller.allUser); 
    app.post(`${basePath}/forgotPassword`,loginCheck, controller.forgotPassword);
    app.post(`${basePath}/resetPassword`,loginCheck, controller.resetPassword); 
    app.post(`${basePath}/updateUserByEmail`,loginCheck, checkAdmin, controller.updateUserByEmail);
    app.delete(`${basePath}/deleteUserByEmail`,loginCheck, checkAdmin, controller.deleteUserByEmail);
    app.post(`${basePath}/change-password`,loginCheck, controller.changePassword); 
};
