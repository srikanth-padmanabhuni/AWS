/**
 * Import required packages
 */
 const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

exports.getValidationErrorsArray = (validationErrors) => {
    const errors = [];
    validationErrors.array().forEach((error) => {
        errors.push({
            field: error.param,
            message: error.msg
        })
    })
    return errors;
}

exports.getAuthenticationDetailsObj = (userName, password) => {
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: userName,
        Password: password,
    });
    return authenticationDetails;
}

exports.getUserDataObj = (userName, userPool) => {
    const userData = {
        Username: userName,
        Pool: userPool
    };
    return userData;
}