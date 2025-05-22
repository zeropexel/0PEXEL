import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.resolve('./lib/purchases.json');
  const data = fs.readFileSync(filePath);
  const purchases = JSON.parse(data);
  res.status(200).json(purchases);
}
