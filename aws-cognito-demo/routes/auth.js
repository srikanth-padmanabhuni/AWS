const express = require("express");
const router = express.Router();
const { check } = require('express-validator');

const { loginUser, registerUser, changePassword, validateToken, deleteUser, logOut } = require("../controllers/auth");

router.post('/login', loginUser);

router.post('/register', 
    [
        check("userName").isEmail().withMessage('Please provide a valid email to register the user'),
        check("password").isLength({min: 8}).withMessage("Password should be atleast of 8 Characters")
    ],
    registerUser);

router.post('/changePassword', 
    [
        check("password").isLength({min: 8}).withMessage("Password should be atleast of 8 Characters"),
        check("newPassword").isLength({min: 8}).withMessage("New Password should be atleast of 8 Characters")
    ],
    changePassword);

router.post('/validateToken', validateToken);

router.delete('/deleteUser', deleteUser);

router.post('/logout', logOut);

module.exports = router;