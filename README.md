Installation
Clone this repository or download the source code

Install dependencies:

```sh
npm install
```
Start the server:

bash
node server.js
The server will run on http://localhost:4242.

API Documentation

Create a PIX Payment
URL: http://localhost:4242/payments
Method: POST
Request Body:

json
{
  "amount": 150.00,
  "paymentType": "PIX",
  "pixKey": "12345678000190",
  "description": "Monthly subscription"
}

Check Payment Status
URL: http://localhost:4242/payments/{transactionId}
Method: GET
(Replace {transactionId} with the actual transaction ID received from the payment creation response)

Health Check
URL: http://localhost:4242/health
Method: GET

For OpenPix API integration (as shown in search result #5), the requests would be:

Create Payment Request:
URL: https://api.openpix.com.br/payment
Method: POST
Headers: Authorization: AppID YOUR_APP_ID, Content-Type: application/json
Request Body:

json
{
  "value": 100,
  "destinationAlias": "12345678000190",
  "destinationAliasType": "CNPJ",
  "comment": "payment comment",
  "correlationID": "payment1"
}
Get Payment Status:
URL: https://api.openpix.com.br/payment/{id}
Method: GET
Headers: Authorization: AppID YOUR_APP_ID
(Replace {id} with payment ID or correlation ID)
