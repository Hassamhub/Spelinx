// backend/controllers/storeController.js
import axios from 'axios';
import crypto from 'crypto';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js'; // adjust path if your User model is elsewhere

const {
  CRYPTOMUS_API_KEY,
  CRYPTOMUS_MERCHANT_ID,
  CRYPTOMUS_WEBHOOK_SECRET
} = process.env;

/**
 * Helper: convert INR -> INX (define your conversion here)
 * For example: 1 INR = 10 INX (example). Adjust to your economics.
 */
const inrToInx = (inr) => {
  const RATE = 10; // 1 INR => 10 INX (update as needed)
  return Math.floor(inr * RATE);
}

/**
 * Initiate payment: create order/payment at UPIGateway and store a pending Transaction.
 * Expects: req.body = { packageId, amountINR }
 */
exports.initiatePayment = async (req, res) => {
  try {
    const { amountINR, packageId } = req.body;
    if (!amountINR || amountINR <= 0) return res.status(400).json({ error: 'Invalid amount' });

    // Create a local pending transaction
    const inxAmount = inrToInx(amountINR);
    const tx = new Transaction({
      user: req.user._id,
      amountINR,
      inxAmount,
      status: 'pending',
      meta: { packageId }
    });
    await tx.save();

    // Build payload per UPIGateway doc (replace keys with actual doc field names)
    const payload = {
      merchant_id: UPIGATEWAY_MERCHANT_ID,
      amount: amountINR,
      currency: 'INR',
      purpose: `INX pack: ${packageId || 'default'}`,
      external_txn_id: tx._id.toString(),
      // optional: callback_url (some providers prefer webhook only)
      // callback_url: `${process.env.BACKEND_BASE_URL || 'https://yourdomain.com'}/api/store/webhook`
    };

    // A basic auth / API key approach — replace with provider auth as required by docs:
    const authHeader = `Bearer ${UPIGATEWAY_API_KEY}`; // adjust if provider uses another scheme

    // Call UPIGateway create payment endpoint (replace path with actual doc path)
    const createUrl = `${UPIGATEWAY_BASE_URL}/v1/payments`; // update if needed
    const resp = await axios.post(createUrl, payload, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Save provider response in transaction meta
    tx.providerPaymentId = resp.data?.data?.payment_id || resp.data?.payment_id || resp.data?.id;
    tx.providerOrderId = resp.data?.data?.order_id || resp.data?.order_id;
    tx.meta.providerResponse = resp.data;
    await tx.save();

    // Expecting provider to return a QR image URL or app deeplink
    const qrImageUrl = resp.data?.data?.qr_image || resp.data?.qr || resp.data?.data?.upi_qr;
    const paymentUrl = resp.data?.data?.payment_url || resp.data?.payment_url;

    return res.json({
      success: true,
      transactionId: tx._id,
      providerPaymentId: tx.providerPaymentId,
      qrImageUrl: qrImageUrl || null,
      paymentUrl: paymentUrl || null,
      raw: resp.data
    });

  } catch (err) {
    console.error('initiatePayment error', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'Failed to initiate payment', details: err?.response?.data || err.message });
  }
};

/**
 * Check payment status (polling endpoint)
 */
exports.checkStatus = async (req, res) => {
  try {
    const { txId } = req.params;
    const tx = await Transaction.findById(txId);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    // If already confirmed/failed - return current status
    if (tx.status !== 'pending') return res.json({ status: tx.status, tx });

    // Query provider for status (replace URL/path with provider docs)
    const queryUrl = `${UPIGATEWAY_BASE_URL}/v1/payments/${tx.providerPaymentId}`;
    const resp = await axios.get(queryUrl, {
      headers: {
        Authorization: `Bearer ${UPIGATEWAY_API_KEY}`
      },
      timeout: 8000
    });

    const providerStatus = resp.data?.data?.status || resp.data?.status;

    // Map provider status to our statuses:
    if (providerStatus === 'SUCCESS' || providerStatus === 'success' || providerStatus === 'COMPLETED') {
      // mark as confirmed and credit user
      tx.status = 'confirmed';
      tx.meta.providerResponse = resp.data;
      await tx.save();

      // credit user wallet atomically
      const user = await User.findById(tx.user);
      if (!user) return res.status(500).json({ error: 'User not found for transaction' });

      user.wallet = (user.wallet || 0) + tx.inxAmount;
      await user.save();

      return res.json({ status: tx.status, creditedINX: tx.inxAmount, userWallet: user.wallet });
    } else if (providerStatus === 'FAILED' || providerStatus === 'failed' || providerStatus === 'CANCELLED') {
      tx.status = 'failed';
      tx.meta.providerResponse = resp.data;
      await tx.save();
      return res.json({ status: tx.status, tx });
    } else {
      // still pending
      tx.meta.providerResponse = resp.data;
      await tx.save();
      return res.json({ status: 'pending', tx });
    }
  } catch (err) {
    console.error('checkStatus error', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'Failed to check status', details: err?.response?.data || err.message });
  }
};

/**
 * Webhook to receive provider async notifications.
 * Use express.raw({ type: 'application/json' }) middleware when mounting this route
 */
exports.webhookHandler = async (req, res) => {
  try {
    // If provider signs webhooks, verify signature using UPIGATEWAY_WEBHOOK_SECRET
    const rawBody = req.body; // when express.raw used, this is Buffer
    const signatureHeader = req.headers['x-upigateway-signature'] || req.headers['x-signature'] || req.headers['signature'];
    if (UPIGATEWAY_WEBHOOK_SECRET && signatureHeader) {
      // HMAC-SHA256 example; confirm with provider docs
      const computed = crypto.createHmac('sha256', UPIGATEWAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
      if (computed !== signatureHeader) {
        console.warn('Webhook signature mismatch');
        return res.status(400).send('invalid signature');
      }
    }

    // Parse body (rawBody might be Buffer)
    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : (rawBody && rawBody.toString ? JSON.parse(rawBody.toString()) : req.body);

    // Extract provider payment id / external_txn_id (depends on provider)
    const providerPaymentId = payload?.data?.payment_id || payload?.payment_id || payload?.id;
    const externalId = payload?.data?.external_txn_id || payload?.external_txn_id || payload?.data?.merchant_ref || payload?.merchant_ref;

    // Find local transaction
    let tx;
    if (externalId) {
      tx = await Transaction.findById(externalId);
    } else if (providerPaymentId) {
      tx = await Transaction.findOne({ providerPaymentId });
    }

    if (!tx) {
      console.warn('Webhook: transaction not found', externalId, providerPaymentId);
      return res.status(404).send('tx not found');
    }

    const providerStatus = payload?.data?.status || payload?.status;
    tx.meta = tx.meta || {};
    tx.meta.webhook = payload;
    if (providerStatus === 'SUCCESS' || providerStatus === 'success' || providerStatus === 'COMPLETED') {
      if (tx.status !== 'confirmed') {
        tx.status = 'confirmed';
        await tx.save();

        // credit user wallet
        const user = await User.findById(tx.user);
        if (user) {
          user.wallet = (user.wallet || 0) + tx.inxAmount;
          await user.save();
        } else {
          console.error('Webhook: user not found for tx', tx._id);
        }
      }
    } else if (providerStatus === 'FAILED' || providerStatus === 'failed' || providerStatus === 'CANCELLED') {
      tx.status = 'failed';
      await tx.save();
    } else {
      // other states - update meta
      tx.meta.lastStatus = providerStatus;
      await tx.save();
    }

    // Respond quickly
    return res.status(200).send('ok');
  } catch (err) {
    console.error('webhook handler error', err);
    return res.status(500).send('error');
  }
};
