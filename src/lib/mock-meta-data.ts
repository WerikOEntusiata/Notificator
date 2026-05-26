export interface CampaignMetric {
  id: string;
  name: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  roas: number;
}

export interface DailyMetric {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export const mockDailyMetrics: DailyMetric[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    spend: Math.floor(Math.random() * 500) + 100,
    impressions: Math.floor(Math.random() * 10000) + 2000,
    clicks: Math.floor(Math.random() * 500) + 50,
    conversions: Math.floor(Math.random() * 20) + 2,
  };
});

export const mockCampaigns: CampaignMetric[] = [
  { id: '1', name: 'Campanha de Vendas - Verão', spend: 15000, impressions: 450000, clicks: 12000, ctr: 2.67, cpc: 1.25, conversions: 450, roas: 4.2 },
  { id: '2', name: 'Retargeting Carrinho', spend: 8500, impressions: 210000, clicks: 9500, ctr: 4.52, cpc: 0.89, conversions: 320, roas: 6.8 },
  { id: '3', name: 'Lançamento Produto X', spend: 22000, impressions: 680000, clicks: 18000, ctr: 2.65, cpc: 1.22, conversions: 610, roas: 3.5 },
  { id: '4', name: 'Tráfego para Blog', spend: 3200, impressions: 150000, clicks: 7200, ctr: 4.80, cpc: 0.44, conversions: 85, roas: 1.8 },
  { id: '5', name: 'Lead Gen - Webinar', spend: 5600, impressions: 280000, clicks: 11200, ctr: 4.00, cpc: 0.50, conversions: 210, roas: 2.9 },
];