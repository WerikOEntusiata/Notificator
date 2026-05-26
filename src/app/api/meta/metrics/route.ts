import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';
import { mockCampaigns, mockDailyMetrics, totalMetrics } from '@/lib/mock-meta-data';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // Se existirem dados salvos no banco, retorna eles
    if (db.data?.metrics && db.data.metrics.campaigns.length > 0) {
      return NextResponse.json(db.data.metrics);
    }

    // Caso contrário, retorna os dados mockados
    return NextResponse.json({
      campaigns: mockCampaigns,
      daily: mockDailyMetrics,
      totals: totalMetrics,
      status: 'mock'
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    // Salva os dados recebidos no banco
    db.data.metrics = {
      campaigns: body.campaigns || [],
      daily: body.daily || [],
      totals: body.totals || {}
    };

    await db.write();

    return NextResponse.json({ 
      success: true, 
      message: 'Dados do dashboard atualizados com sucesso!' 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar métricas:', error);
    return NextResponse.json({ error: 'Erro ao salvar dados' }, { status: 500 });
  }
}