// Razorpay's Node SDK isn't needed for Payment Links — a plain REST call keeps this
// lightweight and avoids adding another dependency.

const RAZORPAY_BASE = 'https://api.razorpay.com/v1';

function authHeader(keyId, keySecret) {
  const token = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  return `Basic ${token}`;
}

export async function createPaymentLink({ keyId, keySecret, amount, description, customerName, customerEmail, notes }) {
  const res = await fetch(`${RAZORPAY_BASE}/payment_links`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(keyId, keySecret),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      description,
      customer: {
        name: customerName,
        email: customerEmail || undefined,
      },
      notify: { sms: false, email: !!customerEmail },
      notes,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.description || 'Razorpay request failed');
  return data;
}
