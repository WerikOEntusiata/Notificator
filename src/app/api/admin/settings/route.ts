import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

const DEFAULT_DATA = {
  examples: [],
  metrics: { campaigns: [], daily: [], totals: {} },
  clients: [],
  settings: { metaAccessToken: '' }
};

export async function GET() {
  try {
    const db = await getDb();
    if (!db.data) {
      db.data = DEFAULT_DATA;
    }
    if (!db.data.settings) {
      db.data.settings = { metaAccessToken: '' };
    }
    return NextResponse.json(db.data.settings);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();
    if (!db.data) {
      db.data = DEFAULT_DATA;
    }
    if (!db.data.settings) {
      db.data.settings = { metaAccessToken: '' };
    }

    if (body.metaAccessToken !== undefined) {
      db.data.settings.metaAccessToken = body.metaAccessToken;
    }

    await db.write();
    return NextResponse.json(db.data.settings);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}