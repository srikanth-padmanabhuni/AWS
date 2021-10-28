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

// Initialize the express app to listen on some specific port
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`App is up and running on port ${PORT}`);
})

// Middlewares
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);