const axios = require('axios');
const crypto = require('crypto');
const ESEWA_SECRET_KEY = '8g8M8PlwO2258sa7';
const ESEWA_PRODUCT_CODE = 'EPAYTEST';
const totalAmount = '100';
const orderId = '11-201-13'; // Standard test order id
const message = `total_amount=${totalAmount},transaction_uuid=${orderId},product_code=${ESEWA_PRODUCT_CODE}`;
const hmac = crypto.createHmac('sha256', ESEWA_SECRET_KEY);
hmac.update(message);
const signature = hmac.digest('base64');
console.log('Signature:', signature);
