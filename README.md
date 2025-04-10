
# Credit Card Payment Mock API

This is a mock server built using [Fastify](https://www.fastify.io/) to simulate a credit card payment system. The API supports creating payments, checking the status of payments, and performing health checks.

## Features

- **Create Credit Card Payments**: Simulate credit card payment processing.
- **Check Payment Status**: Retrieve the status of a specific payment.
- **Health Check Endpoint**: Verify the health of the mock server.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Endpoints](#endpoints)
    - [POST /payments](#post-payments)
    - [GET /payments/:transactionId](#get-paymentstransactionid)
    - [GET /health](#get-health)
3. [Error Handling](#error-handling)
4. [Development](#development)

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn


### Installation

1. Clone the repository:

```bash
git clone &lt;repository-url&gt;
cd &lt;repository-folder&gt;
```

2. Install dependencies:

```bash
npm install
```

3. Start the mock server:

```bash
npm start
```

4. The server will run at `http://localhost:4242`.

---

## Endpoints

### **POST /payments**

Create a new credit card payment.

#### Request

- **URL**: `/payments`
- **Method**: `POST`
- **Headers**:
    - `Content-Type: application/json`
- **Body Parameters**:


| Parameter | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| `amount` | `number` | Yes | The amount to be paid (e.g., 100.50). |
| `paymentType` | `string` | Yes | Must be `"CREDIT_CARD"`. |
| `cardNumber` | `string` | Yes | The credit card number (e.g., "4111111111111111"). |
| `cardHolderName` | `string` | Yes | Name of the cardholder (e.g., "John Doe"). |
| `expirationDate` | `string` | Yes | Expiration date of the card (e.g., "12/25"). |
| `cvv` | `string` | Yes | CVV code of the credit card (e.g., "123"). |


#### Example Request

```bash
curl -X POST http://localhost:4242/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.50,
    "paymentType": "CREDIT_CARD",
    "cardNumber": "4111111111111111",
    "cardHolderName": "John Doe",
    "expirationDate": "12/25",
    "cvv": "123"
  }'
```


#### Response

- **Success (200)**:

```json
{
  "success": true,
  "transactionId": "CC1234567890ABCDEF",
  "amount": 100.5,
  "description": "Credit card payment",
  "status": "waiting_payment",
  "paymentType": "CREDIT_CARD",
  "timestamp": "2025-04-10T14:00:00Z",
  "creditCardInfo": {
    "cardNumber": "4111111111111111",
    "cardHolderName": "John Doe",
    "expirationDate": "12/25"
  },
  "estimatedCreditTime": "2025-04-10T14:01:00Z"
}
```

- **Error (400)**: Missing required fields or invalid payment type.

```json
{
  "success": false,
  "error": "&lt;Error message&gt;",
  "requiredFields": ["amount", "cardNumber", "cardHolderName", "expirationDate", "cvv"]
}
```

- **Error (500)**: Simulated payment failure.

```json
{
  "success": false,
  "error": "&lt;Error message&gt;",
  "errorCode": "&lt;Error code&gt;",
  "timestamp": "&lt;Timestamp&gt;"
}
```


---

### **GET /payments/:transactionId**

Retrieve the status of a specific payment.

#### Request

- **URL**: `/payments/:transactionId`
- **Method**: `GET`
- **Path Parameters**:
    - `transactionId`: The unique ID of the transaction to check.


#### Example Request

```bash
curl -X GET http://localhost:4242/payments/CC1234567890ABCDEF
```


#### Response

- **Success (200)**:

```json
{
  "success": true,
  "transactionId": "CC1234567890ABCDEF",
  "status": "waiting_payment",
  "amount": 100.5,
  "description": "Credit card payment",
  "paymentType": "CREDIT_CARD",
  "timestamp": "&lt;Timestamp&gt;",
  "creditCardInfo": {
    // Only included if status is 'waiting_payment'
    ...
  },
  ...
}
```

- **Error (404)**: Transaction not found.

```json
{
  "success": false,
  "error": "&lt;Error message&gt;",
  ...
}
```


---

### **GET /health**

Check the health status of the server.

#### Request

- **URL**: `/health`
- **Method**: `GET`


#### Example Request

```bash
curl -X GET http://localhost:4242/health
```


#### Response

- **Success (200)**:

```json
{
  "status": "ok",
  "paymentSystem": "CREDIT_CARD",
  "country": "Global"
}
```


---

## Error Handling

The API simulates various error scenarios for testing purposes:

1. **Invalid Payment Type** (`POST /payments`):
    - If `paymentType` is not `"CREDIT_CARD"`, a `400 Bad Request` error is returned.
2. **Missing Required Fields** (`POST /payments`):
    - If any required field is missing, a detailed error message with required fields is returned.
3. **Transaction Not Found** (`GET /payments/:transactionId`):
    - If an invalid or non-existent transaction ID is provided, a `404 Not Found` error is returned.
4. **Simulated Failures**:
    - Random failures are simulated in both payment processing and status retrieval for testing purposes.

---

## Development

### Run Locally in Development Mode

Start the server with hot reload for development:

```bash
npm run dev
```

## Notes

This mock API is intended for testing and development purposes only. It does not process real payments or store sensitive information securely.