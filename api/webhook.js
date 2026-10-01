const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    const payload = req.body;

    console.log('=== WEBHOOK VERSION 4 ===');
    console.log('Incoming webhook payload:', JSON.stringify(payload));

    const orderToInsert = {
      customer_name: String(payload.customer_name ?? ''),
      phone: String(payload.phone ?? ''),
      item: String(payload.item ?? ''),
      qty: Number(payload.qty ?? 1),
      message: String(payload.message ?? ''),
      source: String(payload.source ?? 'WhatsApp'),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    console.log(
      'INSERTING THIS EXACT OBJECT:',
      JSON.stringify(orderToInsert)
    );

    const { data, error } = await supabase
      .from('orders')
      .insert([orderToInsert]);

    console.log('SUPABASE RETURNED:', JSON.stringify(data));
    console.log('SUPABASE ERROR:', JSON.stringify(error));

    if (error) {
      return res.status(500).json({
        error: 'Database write failed',
        details: error.message
      });
    }

    return res.status(200).json({
      received: true,
      version: 'v4'
    });

  } catch (err) {
    console.error('Webhook handler error:', err);

    return res.status(500).json({
      error: 'Internal error',
      details: err.message
    });
  }
};
