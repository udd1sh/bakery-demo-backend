const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  // Only accept POST requests (that's what webhooks send)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    // IMPORTANT: the exact shape of req.body depends entirely on
    // which platform (AiSensy / Interakt) is sending it, and we
    // won't know the real field names until we see one actual
    // test payload from their dashboard. This is a reasonable
    // starting guess we WILL need to adjust.
    const payload = req.body;

    console.log('Incoming webhook payload:', JSON.stringify(payload));

    // Best-guess extraction — update these field names once we
    // see a real payload from AiSensy/Interakt's test webhook.
    const customerName = payload.contact_name || payload.sender_name || 'Unknown';
    const phone = payload.from || payload.phone || payload.wa_id || '';
    const message = payload.message || payload.text || payload.body || '';
    const source = payload.channel === 'instagram' ? 'Instagram DM' : 'WhatsApp';

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customerName,
          phone: phone,
          message: message,
          source: source,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Database write failed' });
    }

    // Respond 200 quickly — most platforms expect a fast response
    // or they'll consider the webhook delivery failed and retry.
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
