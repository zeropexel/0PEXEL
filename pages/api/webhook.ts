// @ts-nocheck
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  let event;
  let body;

  try {
    const { buffer } = await import('micro');
    body = await buffer(req);

    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Error verifying webhook signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const pixelId = session.metadata?.pixelId;
    const buyer = session.customer_details?.email || 'anonymous';

    try {
      const filePath = path.resolve('./lib/purchases.json');
      const purchases = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
        : {};

      purchases[pixelId] = {
        buyer,
        date: new Date().toISOString(),
      };

      fs.writeFileSync(filePath, JSON.stringify(purchases, null, 2));
      console.log(`✅ Pixel ${pixelId} comprado por ${buyer}`);
    } catch (err) {
      console.error('❌ Error saving purchase:', err.message);
      return res.status(500).send('Internal Server Error');
    }
  }

  res.status(200).json({ received: true });
}
