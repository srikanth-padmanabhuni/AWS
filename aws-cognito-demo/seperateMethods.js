/**
 * Registering the user with simple username and password
 */
 registerUser = async (regitrationDetails) => {
    // This list is used when we need additional details like
    // name, dob, place, phn number etc
    const attributeList = [];

    const userName = regitrationDetails.userName;
    const password = regitrationDetails.password;

    try {
        const resp = await userPool.signUp(userName, password, attributeList, null, function(err, result){
            if (err) {
                console.log(err);
                return false;
            }
            cognitoUser = result.user;
            console.log('user registered successfully: ' + result);
            return true;
        });
        Promise.resolve(resp)
        return resp;
    } catch(err) {
        return Promise.reject("Error occurred while registering user");
    }

}

// Login user with given details
 loginUser = async (loginDetails) => {
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
        const resp = await cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log("User logged in successfully: "+result);
                return result;
            },
            onFailure: function(err) {
                console.log("An error occurred while loggin in to user"+err);
                return null;
            },
        });

        Promise.resolve(resp);
        return resp;
    } catch(err) {
        return Promise.reject("Error occurred while logging user");
    }
}


// Validating the JWT Token
validateToken = async (token) => {
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
                return;
            }

            var kid = decodedJwt.header.kid;
            var pem = pems[kid];
            if (!pem) {
                console.log('Invalid token');
                return;
            }

            jwt.verify(token, pem, function(err, payload) {
                if(err) {
                    console.log("Invalid Token.");
                } else {
                    console.log("Valid Token.");
                    console.log(payload);
                }
            });
        } else {
            console.log("Error! Unable to download JWKs");
        }
    });
}

// Delete user after authenticating him
deleteUser = async (deleteUserDetails) => {

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
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            cognitoUser.deleteUser((err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully deleted the user.");
                    console.log(result);
                }
            });
        },
        onFailure: function (err) {
            console.log(err);
        },
    });
}

// Update password
changePassword = async (changePasswordDetails) => {

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
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            cognitoUser.changePassword(password, newPassword, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully changed password of the user.");
                    console.log(result);
                }
            });
        },
        onFailure: function (err) {
            console.log(err);
        },
    });
}

logOut = async (accessToken) => {
    var params = {
        AccessToken: accessToken /* required */
    };
    userPool.globalSignOut(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          return false;
        } else {
          console.log(data);
          return true;
        }
    });
}