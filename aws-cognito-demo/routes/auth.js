const express = require("express");
const router = express.Router();

const { loginUser, registerUser, changePassword, validateToken, deleteUser, logOut } = require("../controllers/auth");

router.post('/login', loginUser);

router.post('/register', registerUser);

router.post('/changePassword', changePassword);

router.post('/validateToken', validateToken);

router.delete('/deleteUser', deleteUser);

router.post('/logout', logOut);

module.exports = router;