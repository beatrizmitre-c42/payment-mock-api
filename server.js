import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

const PORT = 4242;
const HOST = 'localhost';

const transactions = new Map();

const shouldFail = () => false;

const generateCreditCardTransactionId = () => {
  return `CC${Date.now()}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

fastify.post('/payments', async (request, reply) => {
  const { amount, paymentType, cardNumber, cardHolderName, expirationDate, cvv } = request.body;

  fastify.log.info(`Payment attempt received: $${amount}`);

  if (paymentType !== 'CREDIT_CARD') {
    return reply.code(400).send({
      success: false,
      error: 'Only credit card payments are supported',
      supportedTypes: ['CREDIT_CARD']
    });
  }

  if (!amount || !cardNumber || !cardHolderName || !expirationDate || !cvv) {
    return reply.code(400).send({
      success: false,
      error: 'Missing required payment information',
      requiredFields: ['amount', 'cardNumber', 'cardHolderName', 'expirationDate', 'cvv']
    });
  }

  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 1300));

  if (shouldFail()) {
    const errorTypes = [
      { code: 'CARD_DECLINED', message: 'Credit card was declined' },
      { code: 'SYSTEM_UNAVAILABLE', message: 'Payment system temporarily unavailable' }
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

  const transactionId = generateCreditCardTransactionId();
  const timestamp = new Date().toISOString();

  const transaction = {
    transactionId,
    amount,
    description: `Credit card payment`,
    status: 'waiting_payment',
    paymentType: 'CREDIT_CARD',
    timestamp,
    creditCardInfo: {
      cardNumber,
      cardHolderName,
      expirationDate
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

  if (!transactions.has(transactionId)) {
    return reply.code(404).send({
      success: false,
      error: 'Transaction not found',
      transactionId
    });
  }

  const transaction = transactions.get(transactionId);

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
    creditCardInfo:
      transaction.status === 'waiting_payment' ? transaction.creditCardInfo : undefined,
    lastUpdated: transaction.lastUpdated || new Date().toISOString()
  };
});

fastify.get('/health', async () => {
  return { status: 'ok', paymentSystem: 'CREDIT_CARD', country: 'Global' };
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Credit card payment mock server running on ${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
