const AWS = require('aws-sdk');
const DYNAMO_DB = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});

const EMPLOYEE_TABLE = process.env.EMPLOYEE_TABLE;
const {v4 : UUID} = require('uuid');

const DEFAULT_ERROR_STATUS_CODE = 700;

// ------------------ CREATE -----------------------------
module.exports.createEmployee = (event, context, callback) => {
  // event - Contains data regarding request path, body, headers etc data
  // context - Contains data regarding env variables, aws data etc
  // callback for sending data error responses to aws
  console.log(event.body);
  const reqBody = JSON.parse(event.body);
  
  if (!reqBody) {
    console.log("Data not found");
    return callback(null, handleError(DEFAULT_ERROR_STATUS_CODE, "Please provide valid employee data to create."));
  }
  if (!reqBody.firstName || reqBody.firstName.trim() === '') {
    console.log("First Name not found");
    return callback(null, handleError(710, "Please provide valid employee data to create. First Name cannot be null"));
  }
  if (!reqBody.lastName || reqBody.lastName.trim() === '') {
    console.log("Last Name not found");
    return callback(null, handleError(720, "Please provide valid employee data to create. Last Name cannot be null"));
  }
  if (!reqBody.designation || reqBody.designation.trim() === '') {
    console.log("Designation found");
    return callback(null, handleError(730, "Please provide valid employee data to create. Designation cannot be null"));
  }
  if (!reqBody.companyName || reqBody.companyName.trim() === '') {
    console.log("Company Name not found");
    return callback(null, handleError(740, "Please provide valid employee data to create. Company Name cannot be null"));
  }

  const employee = {
    uuid: UUID(),
    first_name: reqBody.firstName,
    last_name: reqBody.lastName,
    designation: reqBody.designation,
    company_name: reqBody.companyName
  };

  return DYNAMO_DB.put({
    TableName: EMPLOYEE_TABLE,
    Item: employee
  })
  .promise()
  .then(() => {
    callback(null, successResponse(200, employee));
  })
  .catch((error) => {
    console.log(error)
    callback(null, handleError(DEFAULT_ERROR_STATUS_CODE, {error: "An error occurred while creating an Employee"}));
  });
}
// -------------------- CREATE END -----------------------

// -------------------- GET ALL --------------------------
module.exports.getAllEmployees = (event, context, callback) => {
  return DYNAMO_DB.scan({
    TableName: EMPLOYEE_TABLE
  })
  .promise()
  .then((allRecords) => {
    callback(null, successResponse(200, allRecords.Items));
  })
  .catch((error) => {
    console.log(error)
    callback(null, handleError(DEFAULT_ERROR_STATUS_CODE, "An error occurred while fetching all Employees"));
  })
}
// -------------------- GET ALL END -------------------------

// -------------------- GET BY ID --------------------------
module.exports.getEmployee = (event, context, callback) => {
  const employeeId = event.pathParameters.id;
  if(!employeeId || employeeId.trim() === '') {
    return callback(null, handleError(750, "Please provide employee id to fetch data"));
  }
  const params = {
    Key: {
      uuid: employeeId
    },
    TableName: EMPLOYEE_TABLE
  };

  return DYNAMO_DB.get(params)
    .promise()
    .then((employeeRecord) => {
      if(!employeeRecord || !employeeRecord.Item) {
        callback(null, handleError(760, "Employee Data not found for given Employee Id:"+employeeId));
      } else {
        callback(null, successResponse(200, employeeRecord.Item));
      }
    })
    .catch((error) => {
      console.log(error)
      callback(null, handleError(DEFAULT_ERROR_STATUS_CODE, "An error occurred while fetching Employee Record"));
    })
}
// -------------------- GET BY ID END --------------------------

// -------------------- UPDATE --------------------------
module.exports.updateEmployee = (event, context, callback) => {
  const employeeId = event.pathParameters.id;
  if(!employeeId || employeeId.trim() === '') {
    return callback(null, handleError(750, "Please provide employee id to update data"));
  }
  const reqBody = JSON.parse(event.body);
  const {firstName, lastName, designation, companyName} = reqBody;
  console.log(firstName, lastName, designation, companyName);
  const params = {
    Key: {
      uuid: employeeId
    },
    TableName: EMPLOYEE_TABLE,
    ConditionExpression: 'attribute_exists(#uuid)',
    ExpressionAttributeNames: { "#uuid": "uuid" }, // Since uuid is a resorved keyword we need to map them with some attributes and use them
    UpdateExpression: 'SET first_name = :firstName, last_name = :lastName, designation = :designation, company_name = :companyName',
    ExpressionAttributeValues: {
      ':firstName': firstName,
      ':lastName': lastName,
      ':designation': designation,
      ':companyName': companyName
    },
    ReturnValues: 'ALL_NEW' // It returns whole updated record. UPDATED_NEW returns only records that we updated
  };

  console.log("Updating Data");

  return DYNAMO_DB.update(params)
    .promise()
    .then((updatedRecord) => {
      console.log(updatedRecord);
      callback(null, successResponse(200, updatedRecord.Attributes));
    })
    .catch((error) => {
      console.log(error)
      callback(null, handleError(DEFAULT_ERROR_STATUS_CODE, "An error occurred while updating the employee"));
    })
}
// -------------------- UPDATE END --------------------------

// -------------------- DELETE --------------------------
module.exports.deleteEmployee = (event, context, callback) => {
  const employeeId = event.pathParameters.id;
  if(!employeeId || employeeId.trim() === '') {
    return callback(null, handleError(750, "Please provide employee id to delete data"));
  }
  const params = {
    Key: {
      uuid: employeeId
    },
    TableName: EMPLOYEE_TABLE
  }

  return DYNAMO_DB.delete(params)
    .promise()
    .then(() => {
      callback(null, successResponse(200, "Employee data with Id:"+employeeId+" deleted succesfully"));
    })
    .catch((error) => {
      console.log(error)
      callback(null, handleError(DEFAULT_ERROR_STATUS_CODE, {error: "An error occurred while deleting the employee record"}));
    })
}
// -------------------- DELETE END --------------------------

// -------------------- SUPPORTING FUNCTIONS --------------------------
function handleError(errorCode, errorText) {
  let response = {
    'statusCode': errorCode,
    'body': JSON.stringify(errorText)
  }
  return response;
}

function successResponse(statusCode, message) {
  let response = {
    'statusCode': statusCode,
    'body': JSON.stringify(message)
  };
  return response;
}

/**
 * API Gateway expects response with keywords like
 * "statusCode", "body", "headers"
 * If any otjer keywords appears it throws Internal Server Error and 502 status 
 */

// -------------------- SUPPORTING FUNCTIONS END --------------------------