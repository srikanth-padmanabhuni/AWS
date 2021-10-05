const AWS = require('aws-sdk');
const DYNAMO_DB = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10'
  });
const TABLE_NAME = process.env.TABLE_NAME;
const UUID = require('/opt/utilities');

function handleResponse(statusCode, message) {
    return {
        'statusCode': statusCode,
        'body': JSON.stringify(message)
    }
}

module.exports.getMedicines = async (event, context, callback) => {
    try {
        const params = {
            TableName: TABLE_NAME
        };
        return DYNAMO_DB.scan(params)
            .promise()
            .then((records) => {
                console.log("Retreived medicines successfully");
                callback(null, handleResponse(200, records.Items));
            })
            .catch((err) => {
                console.log(err);
                callback(null, handleResponse(err.statusCode, err.message));
            })
    } catch (err) {
        console.log(err);
        return callback(null, handleResponse(err.statusCode, err.message));
    }
};

module.exports.getMedicine = async (event, context, callback) => {
    try {
        let medicineId = event.pathParameters.id;
        if (!medicineId || medicineId.trim().length === 0 ) {
            return callback(null, handleResponse(500, "Please provide the medicine id to fetch"));
        }
        const params = {
            Key: {
                uuid: medicineId
            },
            TableName: TABLE_NAME
        }
        return DYNAMO_DB.get(params)
            .promise()
            .then((record) => {
                if (!record || !record.Item) {
                    console.log("No record with id : "+medicineId);
                    callback(null, handleResponse(200, "No records found for the medicine Id : "+medicineId));
                } else {
                    console.log("Retreived medicine successfully with id : "+medicineId);
                    callback(null, handleResponse(200, record.Item));
                }
            })
            .catch((err) => {
                console.log(err);
                callback(null, handleResponse(err.statusCode, err.message));
            })
    } catch (err) {
        console.log(err);
        return callback(null, handleResponse(err.statusCode, err.message));
    }
};

module.exports.updateMedicine = async (event, context, callback) => {
    try {
        let medicineId = event.pathParameters.id;
        if (!medicineId || medicineId.trim().length === 0 ) {
            return callback(null, handleResponse(500, "Please provide the medicine id to update"));
        }
        const reqBody = JSON.parse(event.body);
        const {medicieName, companyName, isInjection, cost, availableDiscount, availableStock, expiryDate} = reqBody;
        console.log(medicieName, companyName, isInjection, cost, availableDiscount, availableStock, expiryDate);
        const params = {
            Key: {
                uuid: medicineId
            },
            TableName: TABLE_NAME,
            ExpressionAttributeNames: { "#uuid": "uuid" },
            ConditionExpression: 'attribute_exists(#uuid)',
            UpdateExpression: 'SET medicine_name = :medicieName, company_name = :companyName, injection = :isInjection, price = :cost, discount = :availableDiscount, stock = :availableStock, expiry_date = :expiryDate',
            ExpressionAttributeValues: {
                ':medicieName': medicieName,
                ':companyName': companyName,
                ':isInjection': isInjection,
                ':cost': cost,
                ':availableDiscount': availableDiscount,
                ':availableStock': availableStock,
                ':expiryDate': expiryDate
            },
            ReturnValues: 'ALL_NEW'
        };
        console.log("Updating the record now");
        return DYNAMO_DB.update(params)
            .promise()
            .then((updatedRecord) => {
                console.log("Record Updated successfully");
                callback(null, handleResponse(200, updatedRecord.Attributes));
            })
            .catch((err) => {
                console.log(err);
                callback(null, handleResponse(err.statusCode, err.message));
            })
    } catch (err) {
        console.log(err);
        return callback(null, handleResponse(err.statusCode, err.message));
    }
};

module.exports.deleteMedicine = async (event, context, callback) => {
    try {
        let medicineId = event.pathParameters.id;
        if (!medicineId || medicineId.trim().length === 0 ) {
            return callback(null, handleResponse(500, "Please provide the medicine id to delete"));
        }
        const params = {
            Key: {
                uuid: medicineId
            },
            TableName: TABLE_NAME
        }
        return DYNAMO_DB.delete(params)
            .promise()
            .then(() => {
                console.log("Deleted medicine successfully");
                callback(null, handleResponse(200, "Medicine record with id : "+medicineId+" deleted successfully!!!"));
            })
            .catch((err) => {
                console.log(err);
                callback(null, handleResponse(err.statusCode, err.message));
            })
    } catch (err) {
        console.log(err);
        return callback(null, handleResponse(err.statusCode, err.message));
    }
};

module.exports.createMedicine = async (event, context, callback) => {
    try {
        const reqBody = JSON.parse(event.body);
        const {medicieName, companyName, isInjection, cost, availableDiscount, availableStock, expiryDate} = reqBody;
        if (!medicieName || medicieName.trim().length === 0) {
            callback(null, handleResponse(500, "Please provide medicine name to save medicine details in inventory"));
        }
        if (!companyName || companyName.trim().length === 0) {
            callback(null, handleResponse(500, "Please provide company name who manufactered the medicine to save medicine details in inventory"));
        }
        if (!cost || cost.trim().length === 0) {
            callback(null, handleResponse(500, "Please provide cost of the medicine to save medicine details in inventory"));
        }
        if (!availableDiscount || availableDiscount.trim().length === 0) {
            callback(null, handleResponse(500, "Please provide available discount details to save medicine details in inventory"));
        }
        if (!availableStock || availableStock.trim().length === 0) {
            callback(null, handleResponse(500, "Please provide available stock details to save medicine details in inventory"));
        }
        if (!expiryDate || expiryDate.trim().length === 0) {
            callback(null, handleResponse(500, "Please provide expiry date of medicine to save medicine details in inventory"));
        }
        if(isInjection.trim().length === 0) {
            isInjection = false;
        }
        const uuid = UUID.getUuid();
        console.log(uuid, medicieName, companyName, isInjection, cost, availableDiscount, availableStock, expiryDate);
        const medicineObj = {
            'uuid': uuid,
            'medicine_name': medicieName,
            'company_name': companyName,
            'injection': isInjection,
            'price': cost,
            'stock': availableStock,
            'discount': availableDiscount,
            'expiry_date': expiryDate
        }
        const params = {
            TableName: TABLE_NAME,
            Item: medicineObj
        };
        return DYNAMO_DB.put(params)
            .promise()
            .then(() => {
                console.log("Created medicine successfully with id : "+uuid);
                callback(null, handleResponse(200, medicineObj));
            })
            .catch((err) => {
                console.log(err);
                callback(null, handleResponse(err.statusCode, err.message));
            })
    } catch (err) {
        console.log(err);
        return callback(null, handleResponse(err.statusCode, err.message));
    }
};