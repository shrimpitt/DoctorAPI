// ── Mock Payment Service ──────────────────────────────────────────────────────
// DEMO MODE ONLY — никаких реальных платежей не проводится.
//
// Для подключения реальных провайдеров замените processPayment():
//   • Stripe:          @stripe/stripe-js → stripe.confirmCardPayment()
//   • Kaspi Pay:       Kaspi Merchant REST API  POST /api/v1/payments
//   • CloudPayments:   CloudPayments Widget     cp.charge({ publicId, ... })
//   • PayPal:          @paypal/react-paypal-js  <PayPalButtons> component

// ── Test card numbers (mock only) ────────────────────────────────────────────
export const TEST_CARDS = {
  // Карты, которые ВСЕГДА проходят в mock режиме (как в Stripe sandbox)
  success: [
    '4242424242424242', // Visa — стандартный тест
    '4111111111111111', // Visa Classic
    '5555555555554444', // MasterCard
    '5105105105105100', // MasterCard Prepaid
  ],
  // Карта, которая ВСЕГДА отклоняется (как Stripe 4000000000000002)
  decline: ['4000000000000002'],
};

// ── Card network detection ────────────────────────────────────────────────────
export function detectCardNetwork(number) {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  return 'unknown';
}

// ── Input formatters ──────────────────────────────────────────────────────────
export function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})(?=.)/g, '$1 ');
}

export function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// ── Validation ────────────────────────────────────────────────────────────────
export function validateCard({ cardNumber, cardholderName, expiry, cvv }) {
  const errors = {};
  const digits = cardNumber.replace(/\s/g, '');

  if (!cardholderName.trim()) {
    errors.cardholderName = 'Введите имя владельца карты';
  }

  if (digits.length < 16) {
    errors.cardNumber = 'Введите корректный 16-значный номер карты';
  }

  if (!expiry || expiry.length < 5) {
    errors.expiry = 'Введите срок действия (ММ/ГГ)';
  } else {
    const [mm, yy] = expiry.split('/');
    const month = parseInt(mm, 10);
    const year = 2000 + parseInt(yy, 10);
    if (month < 1 || month > 12) {
      errors.expiry = 'Неверный месяц';
    } else {
      const now = new Date();
      const expDate = new Date(year, month - 1, 1);
      if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
        errors.expiry = 'Срок действия карты истёк';
      }
    }
  }

  if (!cvv || cvv.length < 3) {
    errors.cvv = 'Введите CVV (3 цифры)';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

// ── Mock decline logic ────────────────────────────────────────────────────────
// Returns true if payment should be declined in mock mode.
// Production: remove this function; decline is determined by the real provider.
export function shouldDecline(cardNumber, cvv) {
  const digits = cardNumber.replace(/\s/g, '');

  // Decline card number (like Stripe's 4000000000000002)
  if (TEST_CARDS.decline.includes(digits)) {
    console.log('[paymentService] shouldDecline=true — decline card number matched:', digits);
    return true;
  }

  // CVV "000" also triggers decline — convenient for testing failure flow
  if (cvv === '000') {
    console.log('[paymentService] shouldDecline=true — CVV is 000');
    return true;
  }

  console.log('[paymentService] shouldDecline=false — card digits:', digits);
  return false;
}
