const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'employee';
const employeesPath = '/getall';
const employeePath = '/employee';
const deleteEmployeePath = '/deleteemployee';

exports.handler = async function(event) {
    console.log("Request event: "+ event);
    let response;
    console.log(event.httpMethod);
    switch(true) {
        case event.httpMethod === 'GET' && event.path === employeesPath:
            response = await getEmployees();
            break;
        case event.httpMethod === 'GET' && event.path === employeePath:
            response = await getEmployee(event.queryStringParameters.employeeId);
            break;
        case event.httpMethod === 'POST' && event.path === employeePath:
            response = await createEmployee(JSON.parse(event.body));
            break;
        case event.httpMethod === 'DELETE' && event.path === deleteEmployeePath:
            const requestBodyForDelete = JSON.parse(event.body);
            response = await deleteEmployee(requestBodyForDelete.employeeId);
            break;
        case event.httpMethod === 'PATCH' && event.path === employeePath:
            const requestBodyForPatch = JSON.parse(event.body);
            response = await updateEmployee(requestBodyForPatch.employeeId, requestBodyForPatch.updateKey, requestBodyForPatch.updateValue);
            break;
        default:
            response = buildResponse(404, 'Route Not Found');
    }
    return response;
}

function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
}

async function getEmployee(employeeId) {
    const params = {
        TableName: dynamodbTableName,
        Key: {
          'uuid': employeeId
        }
      }
      return await dynamodb.get(params).promise().then((response) => {
        return buildResponse(200, response.Item);
      }, (error) => {
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
      });
}

async function updateEmployee(employeeId, updateKey, updateValue) {
    const params = {
        TableName: dynamodbTableName,
        Key: {
          'uuid': employeeId
        },
        UpdateExpression: `set ${updateKey} = :value`,
        ExpressionAttributeValues: {
          ':value': updateValue
        },
        ReturnValues: 'UPDATED_NEW'
      }
      return await dynamodb.update(params).promise().then((response) => {
        const body = {
          Operation: 'UPDATE',
          Message: 'SUCCESS',
          UpdatedAttributes: response
        }
        return buildResponse(200, body);
      }, (error) => {
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
      })
}

async function deleteEmployee(employeeId) {
    const params = {
        TableName: dynamodbTableName,
        Key: {
          'uuid': employeeId
        },
        ReturnValues: 'ALL_OLD'
      }
      return await dynamodb.delete(params).promise().then((response) => {
        const body = {
          Operation: 'DELETE',
          Message: 'SUCCESS',
          Item: response
        }
        return buildResponse(200, body);
      }, (error) => {
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
      })
}

async function createEmployee(employeeData) {
    const params = {
        TableName: dynamodbTableName,
        Item: employeeData
      }
      return await dynamodb.put(params).promise().then(() => {
        const body = {
          Operation: 'SAVE',
          Message: 'SUCCESS',
          Item: employeeData
        }
        return buildResponse(200, body);
      }, (error) => {
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
      })
}

async function getEmployees() {
    const params = {
        TableName: dynamodbTableName
      }
      const allEmployees = await scanAll(params);
      const body = {
        products: allEmployees
      }
      return buildResponse(200, body);
}

const scanAll = async (params) => {
  let lastEvaluatedKey = 'dummy'; // string must not be empty
  const itemsAll = [];
  while (lastEvaluatedKey) {
    const data = await dynamodb.scan(params).promise();
    itemsAll.push(...data.Items);
    lastEvaluatedKey = data.LastEvaluatedKey;
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
  }
  return itemsAll;
}