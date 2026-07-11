const crypto = require('crypto');
function generateEsewaSignature(totalAmount, transactionUuid, productCode) {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  console.log("Message to sign:", message);
  const hmac = crypto.createHmac('sha256', '8g8M8PlwO2258sa7');
  hmac.update(message);
  return hmac.digest('base64');
}
console.log("Signature:", generateEsewaSignature('100', '12345', 'EPAYTEST'));
