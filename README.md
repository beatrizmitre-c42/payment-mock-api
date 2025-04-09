# PIX Payment Mock API

This is a mock API for PIX payments that simulates the behavior of a real payment gateway. It allows you to create PIX payment requests and check their status, with random failures to help test error handling in your application.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn


### Installation

1. Clone this repository or download the source code
2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node pix-payment-mock-server.js
```

The server will run on `http://localhost:4242`.

## API Documentation

### Health Check

Check if the API is running properly.

**URL**: `http://localhost:4242/health`
**Method**: GET

**Example Response:**

```json
{
  "status": "ok",
  "paymentSystem": "PIX",
  "country": "Brazil"
}
```


### Create Payment

Create a new PIX payment request.

**URL**: `http://localhost:4242/payments`
**Method**: POST

**Request Body:**


| Field | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| amount | number | Yes | Payment amount |
| paymentType | string | Yes | Must be "PIX" |
| pixKey | string | Yes | CNPJ number to receive the payment |
| description | string | No | Payment description |

**Example Request:**

```bash
curl -X POST http://localhost:4242/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "paymentType": "PIX",
    "pixKey": "12345678000190",
    "description": "Monthly subscription"
  }'
```

**Example Success Response:**

```json
{
  "success": true,
  "transactionId": "PIX1649876543ABCDEF",
  "endToEndId": "E49876543ABC",
  "amount": 150.00,
  "description": "Monthly subscription",
  "status": "waiting_payment",
  "receiverInfo": {
    "type": "CNPJ",
    "key": "12345678000190"
  },
  "paymentType": "PIX",
  "timestamp": "2025-04-09T15:42:21.123Z",
  "expiresAt": "2025-04-09T16:42:21.123Z",
  "pixPaymentInfo": {
    "pixKey": "12345678000190",
    "pixCopyPasteCode": "00020126580014BR.GOV.BCB.PIX0136abcdef1234567890...",
    "pixQrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&amp;data=00020126580014BR.GOV.BCB.PIX0136abcdef1234567890..."
  },
  "estimatedCreditTime": "2025-04-09T15:43:21.123Z"
}
```

**Possible Error Responses:**

1. Invalid payment type:
```json
{
  "success": false,
  "error": "Only PIX payments are supported",
  "supportedTypes": ["PIX"]
}
```

2. Missing required fields:
```json
{
  "success": false,
  "error": "Missing required payment information",
  "requiredFields": ["amount", "pixKey"]
}
```

3. Processing error (random, simulates real-world failures):
```json
{
  "success": false,
  "error": "PIX payment processing timed out",
  "errorCode": "PIX_TIMEOUT",
  "timestamp": "2025-04-09T15:42:21.123Z"
}
```


### Check Payment Status

Check the status of an existing payment.

**URL**: `http://localhost:4242/payments/:transactionId`
**Method**: GET

**Parameters:**


| Parameter | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| transactionId | string | Yes | The transaction ID returned when creating the payment |

**Example Request:**

```bash
curl -X GET http://localhost:4242/payments/PIX1649876543ABCDEF
```

**Example Success Response:**

```json
{
  "success": true,
  "transactionId": "PIX1649876543ABCDEF",
  "status": "waiting_payment",
  "amount": 150.00,
  "description": "Monthly subscription",
  "paymentType": "PIX",
  "timestamp": "2025-04-09T15:42:21.123Z",
  "pixPaymentInfo": {
    "pixKey": "12345678000190",
    "pixCopyPasteCode": "00020126580014BR.GOV.BCB.PIX0136abcdef1234567890...",
    "pixQrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&amp;data=00020126580014BR.GOV.BCB.PIX0136abcdef1234567890..."
  },
  "lastUpdated": "2025-04-09T15:45:30.456Z"
}
```

**Possible Payment Statuses:**


| Status | Description |
| :-- | :-- |
| waiting_payment | Payment has been created but not yet paid |
| processing | Payment is being processed |
| completed | Payment has been successfully processed |
| expired | Payment has expired without being paid |
| failed | Payment processing failed |

**Possible Error Responses:**

1. Transaction not found:
```json
{
  "success": false,
  "error": "Transaction not found",
  "transactionId": "PIX1649876543ABCDEF"
}
```

2. Status check failed:
```json
{
  "success": false,
  "error": "Failed to retrieve payment status",
  "errorCode": "STATUS_CHECK_FAILED",
  "timestamp": "2025-04-09T15:45:30.456Z"
}
```


## Implementation Notes

1. **Payment Flow:**
    - Create a payment using the POST /payments endpoint
    - Receive the payment information (pixKey, pixCopyPasteCode, pixQrCodeUrl)
    - Present this information to your user so they can complete the payment
    - Periodically check the payment status using GET /payments/:transactionId
    - When status changes to "completed", the payment was successful
2. **Error Handling:**
    - The API randomly simulates failures to help test your error handling
    - Payment creation fails approximately 25% of the time
    - Status checks fail approximately 15% of the time
    - Implement proper retry logic in your client application
3. **Payment Expiration:**
    - PIX payments expire after 1 hour (indicated by the expiresAt field)
    - After expiration, the status will change to "expired"
