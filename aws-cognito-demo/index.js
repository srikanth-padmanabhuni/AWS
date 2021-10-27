/**
 * Author: Srikanth Padmanabhuni
 * App: AWS Cognito Demo
 */

/** 
 * Installations to be done 
    - npm install --save amazon-cognito-identity-js
    - npm install --save aws-sdk
    - npm install --save request
    - npm install --save jwk-to-pem
    - npm install --save jsonwebtoken
    - npm install --save node-fetch
    - npm install --save express
    - npm install --save dotenv
 * Create .env file and add all config details in it
*/

/**
 * Import all required packages
 */
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
//global.fetch = require('node-fetch');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

// create a new express application
const app = express();

const PORT = process.env.PORT;
const POOL_ID = process.env.POOL_ID;
const POOL_REGION = process.env.POOL_REGION;
const APP_CLIENT_ID = process.env.APP_CLIENT_ID;

// Initialize the express app to listen on some specific port
app.listen(PORT, () => {
    console.log(`App is up and running on port ${PORT}`);
})

// Make use of json body and ur encoding by express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Then define pool info
const poolData = {    
    UserPoolId : POOL_ID, 
    ClientId : APP_CLIENT_ID
};

// Initislize the user pool
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

app.post('/login', (req, res) => {

    const loginDetails = req.body;
    
    const userName = loginDetails.userName;
    const password = loginDetails.password;

    // Initialize authentication details
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username : userName,
        Password : password,
    });

    // Initialize the cognito user for a given userpool and authenticate with password
    var userData = {
        Username : userName,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    try {
        // Authenticate username and password for a given cognito user in given pool
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log("User logged in successfully: ");
               // console.log("Token : "+ result.idToken.jwtToken);
                return res.status(200).send({
                    "message": "Logged in successfully!!!",
                    "token": result.idToken.jwtToken
                });
            },
            onFailure: function(err) {
                console.log("An error occurred while loggin in to user"+err);
                return res.status(500).send(err);
            },
        });
    } catch(err) {
        return res.status(500).send(err);
    }
})

app.post('/register', (req, res) => {

    const regitrationDetails = req.body;

    // This list is used when we need additional details like
    // name, dob, place, phn number etc
    const attributeList = [];

    const userName = regitrationDetails.userName;
    const password = regitrationDetails.password;
    try {
        userPool.signUp(userName, password, attributeList, null, function(err, result){
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                console.log('user registered successfully: ' + result);
                return res.status(200).send("User has registered successfully !!!");
            }
        });
    } catch(err) {
        return res.status(500).send(err);
    }
})

app.post('/changePassword', (req, res) => {
    const changePasswordDetails = req.body;

    const userName = changePasswordDetails.userName;
    const password = changePasswordDetails.password;
    const newPassword = changePasswordDetails.newPassword;

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: userName,
        Password: password,
    });

    var userData = {
        Username: userName,
        Pool: userPool
    };
    
    try {
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                cognitoUser.changePassword(password, newPassword, (err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(err);
                    } else {
                        console.log("Successfully changed password of the user.");
                        console.log(result);
                        return res.status(200).send("Successfully changed the password!!!");
                    }
                });
            },
            onFailure: function (err) {
                console.log(err);
                return res.status(500).send(err);
            },
        });
    } catch(err) {
        console.log(err);
        return res.status(500).send(err);
    }

})

app.post('/validateToken', (req, res) => {
    const token = req.body.token;
    request({
        url: `https://cognito-idp.${POOL_REGION}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            pems = {};
            var keys = body['keys'];
            for(var i = 0; i < keys.length; i++) {
                //Convert each key to PEM
                var key_id = keys[i].kid;
                var modulus = keys[i].n;
                var exponent = keys[i].e;
                var key_type = keys[i].kty;
                var jwk = { kty: key_type, n: modulus, e: exponent};
                var pem = jwkToPem(jwk);
                pems[key_id] = pem;
            }

            //validate the token
            var decodedJwt = jwt.decode(token, {complete: true});
            if (!decodedJwt) {
                console.log("Not a valid JWT token");
                return res.status(500).send("Not a valid Token");
            }

            var kid = decodedJwt.header.kid;
            var pem = pems[kid];
            if (!pem) {
                console.log('Invalid token');
                return res.status(500).send("Not a valid Token");
            }

            jwt.verify(token, pem, function(err, payload) {
                if(err) {
                    console.log("Invalid Token.");
                    return res.status(500).send(err);
                } else {
                    console.log("Valid Token.");
                    console.log(payload);
                    return res.status(200).send({
                        "message": "Token is valid"
                    });
                }
            });
        } else {
            console.log("Error! Unable to download JWKs");
            return res.status(500).send("An error occurred while validating the token");
        }
    });
})

app.delete('/deleteUser', (req, res) => {
    const deleteUserDetails = req.body;

    const userName = deleteUserDetails.userName;
    const password = deleteUserDetails.password;

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: userName,
        Password: password,
    });

    var userData = {
        Username: userName,
        Pool: userPool
    };

    try {

        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                cognitoUser.deleteUser((err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(err);
                    } else {
                        console.log("Successfully deleted the user.");
                        console.log(result);
                        return res.status(200).send({
                            "message": "User deleted successfully!!!!"
                        });
                    }
                });
            },
            onFailure: function (err) {
                console.log(err);
                return res.status(500).send(err);
            },
        });

    } catch(err) {
        return res.status(500).send(err);
    }
})

app.post('/logout', (req, res) => {
    const accessToken = req.body.token;
    
    var params = {
        AccessToken: accessToken
    };

    console.log(userPool);

    res.status(200).send('No Proper Implementation yet')
    // userPool.signOut(params, function(err, data) {
    //     if (err) {
    //       console.log(err, err.stack);
    //       return false;
    //     } else {
    //       console.log(data);
    //       return true;
    //     }
    // });
})