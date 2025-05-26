// @ts-nocheck

import Stripe from 'stripe';
import { buffer } from 'micro';
import fs from 'fs';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️ Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const pixelId = session.metadata.pixelId;
    const buyer = session.customer_email || session.customer_details?.email || 'anonymous';

    const filePath = path.resolve('./lib/purchases.json');
    const purchases = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath))
      : {};

    purchases[pixelId] = {
      buyer,
      date: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(purchases, null, 2));
    console.log(`✅ Pixel ${pixelId} comprado por ${buyer}`);
  }

  res.status(200).json({ received: true });
}
