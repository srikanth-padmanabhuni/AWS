/**
 * Author: Srikanth Padmanabhuni
 * App: AWS Cognito Demo
 */

/**
 * Import all required packages
 */
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

// create a new express application
const app = express();

// Routes
const authRoutes = require("./routes/auth");

//logger
const { log } = require("./loggers/logger");

// Initialize the express app to listen on some specific port
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`App is up and running on port ${PORT}`);
})

// Kind of cors
const frontendUrl = process.env.frontendUrl;
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", frontendUrl);
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });


// Middlewares
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(log);

app.use('/auth', log, authRoutes);