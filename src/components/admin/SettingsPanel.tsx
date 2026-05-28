"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, Eye, EyeOff, CheckCircle, Settings } from 'lucide-react';

interface Settings {
  metaAccessToken: string;
}

interface SettingsPanelProps {
  settings: Settings | null;
  onSave: (settings: Settings) => void;
}

export default function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [token, setToken] = useState(settings?.metaAccessToken || '');
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (settings) {
      setToken(settings.metaAccessToken || '');
    }
  }, [settings]);

  const handleSave = async () => {
    if (!token.trim()) {
      toast.error('Digite o token de acesso');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metaAccessToken: token.trim() }),
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      toast.success('Configurações salvas com sucesso!');
      onSave({ metaAccessToken: token.trim() });
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const isConfigured = !!settings?.metaAccessToken;

  return (
    <Card className="bg-[#18191A] border-gray-800 text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-purple-400" />
          <CardTitle className="text-lg">Token Meta Ads</CardTitle>
          {isConfigured && (
            <div className="flex items-center gap-1 bg-green-900/40 border border-green-700 rounded-full px-2 py-0.5">
              <CheckCircle size={12} className="text-green-400" />
              <span className="text-[11px] text-green-400">Configurado</span>
            </div>
          )}
          {!isConfigured && (
            <div className="flex items-center gap-1 bg-yellow-900/40 border border-yellow-700 rounded-full px-2 py-0.5">
              <span className="text-[11px] text-yellow-400">Não configurado</span>
            </div>
          )}
        </div>
        <CardDescription className="text-gray-400">
          Token de acesso global para buscar contas de anúncios automaticamente ao criar clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Access Token</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cole o token de acesso da Meta Ads"
                className="bg-[#242526] border-gray-700 text-white font-mono text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !token.trim()}
              className="bg-purple-600 hover:bg-purple-700 shrink-0"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Salvar
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Permissões necessárias: <code className="text-blue-400">ads_management</code> ou <code className="text-blue-400">ads_read</code>.
            Com este token configurado, ao criar um cliente basta clicar em &quot;Buscar Contas&quot; para ver todas as contas disponíveis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}