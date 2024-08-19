const controller = require('../controller');
const {loginCheck, isAuth, isAdmin} = require("../middleware/auth");
const multer = require("multer");

const basePath = '/api';


module.exports = app => {
    //For signin page
    app.post(`${basePath}/isadmin`, controller.isAdmin);
    app.post(`${basePath}/signup`, controller.postSignup);
    app.post(`${basePath}/signin`, controller.postSignin);
    app.post(`${basePath}/user`, loginCheck, isAuth, isAdmin, controller.allUser);
//For operations in Users
    app.get(`${basePath}/user/all-user`, controller.getAllUser);
    app.post(`${basePath}/user/add-user`, controller.postAddUser);
    app.post(`${basePath}/user/edit-user`, controller.postEditUser);
    app.post(`${basePath}/user/delete-user`, controller.getDeleteUser);
    app.post(`${basePath}/user/change-password`, controller.changePassword);
    app.post(`${basePath}/user/single-user`, controller.getSingleUser);
};