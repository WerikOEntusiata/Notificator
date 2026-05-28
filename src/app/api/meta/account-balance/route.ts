import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, accountId } = await request.json();

    if (!accessToken || !accountId) {
      return NextResponse.json(
        { error: 'Token e ID da conta são obrigatórios' },
        { status: 400 }
      );
    }

    const formattedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${formattedId}?fields=name,account_id,currency,amount_spent,balance,spend_cap&access_token=${encodeURIComponent(accessToken)}`
    );

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || 'Erro ao buscar saldo' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      name: data.name,
      accountId: data.account_id,
      currency: data.currency || 'BRL',
      amountSpent: data.amount_spent ? parseInt(data.amount_spent) / 100 : 0,
      balance: data.balance ? parseInt(data.balance) / 100 : 0,
      spendCap: data.spend_cap ? parseInt(data.spend_cap) / 100 : 0,
    });
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com a API do Meta' },
      { status: 500 }
    );
  }
}