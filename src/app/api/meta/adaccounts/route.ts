import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { accessToken: reqToken } = await request.json();

    // Usa o token enviado ou busca o global nas configurações
    let accessToken = reqToken;
    if (!accessToken) {
      const db = await getDb();
      accessToken = db.data?.settings?.metaAccessToken;
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso não configurado. Configure nas Configurações do admin.' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=name,account_id,currency,amount_spent,balance,spend_cap&access_token=${encodeURIComponent(accessToken)}`
    );

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || 'Erro ao buscar contas' },
        { status: 400 }
      );
    }

    const accounts = (data.data || []).map((acc: any) => ({
      id: acc.id,
      accountId: acc.account_id,
      name: acc.name,
      currency: acc.currency || 'BRL',
      amountSpent: acc.amount_spent ? parseInt(acc.amount_spent) / 100 : 0,
      balance: acc.balance ? parseInt(acc.balance) / 100 : 0,
      spendCap: acc.spend_cap ? parseInt(acc.spend_cap) / 100 : 0,
    }));

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com a API do Meta' },
      { status: 500 }
    );
  }
}