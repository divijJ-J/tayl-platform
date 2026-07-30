// Sends a plain text WhatsApp message via Meta's official Cloud API.
// Requires the company's own Phone Number ID + Access Token (BYO keys,
// same pattern as Razorpay) — set up in Settings > WhatsApp.
export async function sendWhatsAppMessage(phoneNumberId, accessToken, to, text) {
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to send WhatsApp message');
  }
  return data;
}
