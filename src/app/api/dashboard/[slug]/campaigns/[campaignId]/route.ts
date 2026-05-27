import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

const MESSAGE_ACTION_TYPE = 'onsite_conversion.total_messaging_connection';

function extractMessages(data: any): number {
  let count = 0;
  if (data.actions && Array.isArray(data.actions)) {
    data.actions.forEach((a: any) => {
      if (a.action_type === MESSAGE_ACTION_TYPE) {
        count += parseInt(a.value || '0');
      }
    });
  }
  if (count === 0 && data.results) {
    count = parseInt(data.results || '0');
  }
  return count;
}

function getDateRange(period: string) {
  const now = new Date();
  let since = new Date();
  switch (period) {
    case '7d': since.setDate(now.getDate() - 7); break;
    case '15d': since.setDate(now.getDate() - 15); break;
    case '30d': since.setDate(now.getDate() - 30); break;
    default: since.setDate(now.getDate() - 30);
  }
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  return `{"since":"${formatDate(since)}","until":"${formatDate(now)}"}`;
}

async function fetchCampaignDetails(campaignId: string, accessToken: string, period: string) {
  const baseUrl = `https://graph.facebook.com/v19.0/${campaignId}`;
  const timeRange = getDateRange(period);
  const metricFields = 'spend,impressions,reach,clicks,frequency,actions,results,cpm,cpc,ctr';

  try {
    // 1. Métricas totais da campanha
    const totalsRes = await fetch(
      `${baseUrl}/insights?access_token=${accessToken}&fields=${metricFields}&time_range=${encodeURIComponent(timeRange)}`
    );
    const totalsJson = await totalsRes.json();

    if (totalsJson.error) {
      return { error: totalsJson.error.message || 'Erro na API Meta', status: 'error' };
    }

    if (!totalsJson.data || totalsJson.data.length === 0) {
      return { error: 'Nenhum dado encontrado para esta campanha', status: 'no-data' };
    }

    const t = totalsJson.data[0];
    const msgs = extractMessages(t);
    const spend = parseFloat(t.spend || '0');
    const impressions = parseInt(t.impressions || '0');
    const reach = parseInt(t.reach || '0');
    const clicks = parseInt(t.clicks || '0');

    const totals = {
      spend,
      impressions,
      reach,
      clicks,
      messages: msgs,
      frequency: parseFloat(t.frequency || '0'),
      cpm: parseFloat(t.cpm || '0'),
      cpc: parseFloat(t.cpc || '0'),
      ctr: parseFloat(t.ctr || '0'),
      costPerMessage: msgs > 0 ? spend / msgs : 0,
      messageRate: clicks > 0 ? (msgs / clicks) * 100 : 0,
    };

    // 2. Breakdown por Ad Set
    const adSetRes = await fetch(
      `${baseUrl}/insights?access_token=${accessToken}&level=adset&fields=adset_id,adset_name,${metricFields}&time_range=${encodeURIComponent(timeRange)}&limit=100`
    );
    const adSetJson = await adSetRes.json();

    const adSets = (adSetJson.data || []).map((a: any) => {
      const aMsgs = extractMessages(a);
      const aSpend = parseFloat(a.spend || '0');
      return {
        id: a.adset_id,
        name: a.adset_name,
        spend: aSpend,
        impressions: parseInt(a.impressions || '0'),
        clicks: parseInt(a.clicks || '0'),
        reach: parseInt(a.reach || '0'),
        messages: aMsgs,
        cpm: parseFloat(a.cpm || '0'),
        ctr: parseFloat(a.ctr || '0'),
        cpc: parseFloat(a.cpc || '0'),
        frequency: parseFloat(a.frequency || '0'),
      };
    });

    // 3. Breakdown por Anúncio
    const adRes = await fetch(
      `${baseUrl}/insights?access_token=${accessToken}&level=ad&fields=ad_id,ad_name,${metricFields}&time_range=${encodeURIComponent(timeRange)}&limit=100`
    );
    const adJson = await adRes.json();

    const ads = (adJson.data || []).map((a: any) => {
      const aMsgs = extractMessages(a);
      const aSpend = parseFloat(a.spend || '0');
      return {
        id: a.ad_id,
        name: a.ad_name,
        spend: aSpend,
        impressions: parseInt(a.impressions || '0'),
        clicks: parseInt(a.clicks || '0'),
        reach: parseInt(a.reach || '0'),
        messages: aMsgs,
        cpm: parseFloat(a.cpm || '0'),
        ctr: parseFloat(a.ctr || '0'),
        cpc: parseFloat(a.cpc || '0'),
        frequency: parseFloat(a.frequency || '0'),
      };
    });

    // 4. Dados diários da campanha
    const dailyRes = await fetch(
      `${baseUrl}/insights?access_token=${accessToken}&level=campaign&fields=spend,impressions,reach,clicks,actions,results&time_range=${encodeURIComponent(timeRange)}&time_increment=1`
    );
    const dailyJson = await dailyRes.json();

    const daily = (dailyJson.data || []).map((d: any) => ({
      date: d.date_start
        ? new Date(d.date_start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        : '',
      spend: parseFloat(d.spend || '0'),
      messages: extractMessages(d),
      impressions: parseInt(d.impressions || '0'),
      clicks: parseInt(d.clicks || '0'),
      reach: parseInt(d.reach || '0'),
    })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { totals, adSets, ads, daily, status: 'success' };
  } catch (error) {
    console.error('Erro ao buscar detalhes da campanha:', error);
    return { error: 'Falha na conexão com Meta Ads', status: 'error' };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; campaignId: string }> }
) {
  try {
    const { slug, campaignId } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    const db = await getDb();
    const client = db.data?.clients?.find((c) => c.slug === slug);

    if (!client) {
      return NextResponse.json({ error: 'Dashboard não encontrado' }, { status: 404 });
    }

    if (!client.isActive) {
      return NextResponse.json({ error: 'Dashboard desativado' }, { status: 403 });
    }

    const formattedId = client.metaAdsAccountId.startsWith('act_')
      ? client.metaAdsAccountId.replace('act_', '')
      : client.metaAdsAccountId;

    const campaignMetaId = campaignId.startsWith('act_') ? campaignId.replace('act_', '') : campaignId;
    const result = await fetchCampaignDetails(campaignMetaId, client.metaAdsAccessToken, period);

    return NextResponse.json({
      ...result,
      clientName: client.name,
      campaignMetaId,
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes da campanha:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}