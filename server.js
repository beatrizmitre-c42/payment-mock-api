import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

const PORT = 4242;
const HOST = 'localhost';

const transactions = new Map();

const shouldFail = () => false

const generatePixTransactionId = () => {
  return `PIX${Date.now()}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

const generatePixCopyPasteCode = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 77; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

fastify.post('/payments', async (request, reply) => {
  const { amount, paymentType, pixKey, description } = request.body;

  fastify.log.info(`Payment attempt received: $${amount}`);

  if (paymentType !== 'PIX') {
    return reply.code(400).send({
      success: false,
      error: 'Only PIX payments are supported',
      supportedTypes: ['PIX']
    });
  }

  if (!amount || !pixKey) {
    return reply.code(400).send({
      success: false,
      error: 'Missing required payment information',
      requiredFields: ['amount', 'pixKey']
    });
  }

  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 1300));

  if (shouldFail()) {
    const errorTypes = [
      { code: 'PIX_TIMEOUT', message: 'PIX payment processing timed out' },
      { code: 'SYSTEM_UNAVAILABLE', message: 'PIX system temporarily unavailable' }
    ];

    const error = errorTypes[Math.floor(Math.random() * errorTypes.length)];

    fastify.log.error(`Payment failed: ${error.code}`);
    return reply.code(500).send({
      success: false,
      error: error.message,
      errorCode: error.code,
      timestamp: new Date().toISOString()
    });
  }

  const transactionId = generatePixTransactionId();
  const endToEndId = `E${transactionId.substring(3, 15)}`;
  const timestamp = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 3600000).toISOString();

  const pixCopyPasteCode = generatePixCopyPasteCode();
  const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCopyPasteCode)}`;

  const transaction = {
    transactionId,
    endToEndId,
    amount,
    description: description || 'PIX payment',
    status: 'waiting_payment',
    receiverInfo: {
      type: 'CNPJ',
      key: pixKey
    },
    paymentType: 'PIX',
    timestamp,
    expiresAt,
    pixPaymentInfo: {
      pixKey: pixKey,
      pixCopyPasteCode: pixCopyPasteCode,
      pixQrCodeUrl: pixQrCodeUrl
    },
    estimatedCreditTime: new Date(Date.now() + 60000).toISOString()
  };

  transactions.set(transactionId, transaction);

  return {
    success: true,
    ...transaction
  };
});

fastify.get('/payments/:transactionId', async (request, reply) => {
  const { transactionId } = request.params;

  fastify.log.info(`Checking status for transaction: ${transactionId}`);

  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 450));

  if (Math.random() < 0.15) {
    return reply.code(500).send({
      success: false,
      error: 'Failed to retrieve payment status',
      errorCode: 'STATUS_CHECK_FAILED',
      timestamp: new Date().toISOString()
    });
  }

  if (!transactions.has(transactionId)) {
    if (Math.random() < 0.5) {
      return reply.code(404).send({
        success: false,
        error: 'Transaction not found',
        transactionId
      });
    } else {
      const possibleStatuses = ['waiting_payment', 'completed'];
      const randomStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];

      const pixCopyPasteCode = generatePixCopyPasteCode();
      const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCopyPasteCode)}`;

      return {
        success: true,
        transactionId,
        status: randomStatus,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Random time in the last 24h
        lastUpdated: new Date().toISOString(),
        pixPaymentInfo: randomStatus === 'waiting_payment' ? {
          pixKey: "12345678000190", // Example CNPJ
          pixCopyPasteCode: pixCopyPasteCode,
          pixQrCodeUrl: pixQrCodeUrl
        } : undefined
      };
    }
  }

  const transaction = transactions.get(transactionId);

  const pixPaymentInfo = transaction.status === 'waiting_payment' ? transaction.pixPaymentInfo : undefined;

  if (transaction.status === 'waiting_payment' && Math.random() < 0.3) {
    const newStatus = Math.random() < 0.8 ? 'completed' : 'waiting_payment';
    transaction.status = newStatus;
    transaction.lastUpdated = new Date().toISOString();
    transactions.set(transactionId, transaction);
  }

  return {
    success: true,
    transactionId: transaction.transactionId,
    status: transaction.status,
    amount: transaction.amount,
    description: transaction.description,
    paymentType: transaction.paymentType,
    timestamp: transaction.timestamp,
    pixPaymentInfo: pixPaymentInfo,
    lastUpdated: transaction.lastUpdated || new Date().toISOString()
  };
});

fastify.get('/health', async () => {
  return { status: 'ok', paymentSystem: 'PIX', country: 'Brazil' };
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`PIX payment mock server running on ${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
