import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const { pixelId, buyer } = req.body;

  const filePath = path.resolve('./lib/purchases.json');
  const purchases = JSON.parse(fs.readFileSync(filePath));
  purchases[pixelId] = {
    buyer: buyer || 'anonymous',
    date: new Date().toISOString(),
  };
  fs.writeFileSync(filePath, JSON.stringify(purchases, null, 2));

  res.status(200).json({ status: 'saved' });
}
