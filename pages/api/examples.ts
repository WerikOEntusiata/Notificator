import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await getDb();

    if (req.method === 'GET') {
      const examples = db.data?.examples || [];
      return res.status(200).json(examples);
    } else if (req.method === 'POST') {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const examples = db.data?.examples || [];
      const newId = examples.length > 0 ? Math.max(...examples.map((e: { id: number }) => e.id)) + 1 : 1;

      const newExample = {
        id: newId,
        name,
        createdAt: new Date().toISOString(),
      };

      db.data?.examples.push(newExample);
      await db.write();

      return res.status(201).json(newExample);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Database operation failed:', error.message || error);
    return res.status(500).json({ message: 'Internal server error', error: error.message || 'Unknown error' });
  }
}