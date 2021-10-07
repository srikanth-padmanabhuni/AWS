/**
 * This JS Code depicts how to retreive secretes stored in 
 * AWS Secrete Manager
 */
const AWS = require('aws-sdk');
/**
 * Always update region configuration
 */
AWS.config.update({
    region: 'us-east-1'
});
/**
 * Always services should be created with new keyword
 */
const secreteManager = new AWS.SecretsManager();
async function retreiveSecrete(key) {
    if (!key) {
        console.log("No key found to retreive secrete");
        return {
            'statusCode': 500,
            'body': {'error': 'Please provide valid key to retreive the secrete'}
        };
    }
    const params = {
        SecretId: key
    };
    try {
        const secret = await secreteManager.getSecretValue(params).promise();
        console.log(secret);
        return {
            'statusCode': 200,
            'body': {'success': JSON.stringify(secret)}
        };
    } catch(err) {
        console.log(err);
        return {
            'statusCode': err.statusCode,
            'body': {'error': err}
        };
    }
}

if (process.argv.length < 3) {
    console.log('Please provide a secret key');
    return {
        'statusCode': 500,
        'body': {'error': 'Please provide a secrete key'}
    };
}
  
const keyArg = process.argv[2]
retreiveSecrete(keyArg)