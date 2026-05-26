"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, X } from 'lucide-react';

interface Client {
  id?: string;
  name: string;
  metaAdsAccountId: string;
  metaAdsAccessToken: string;
}

interface ClientFormProps {
  client?: Client;
  onSave: () => void;
  onCancel: () => void;
}

export default function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [name, setName] = useState(client?.name || '');
  const [accountId, setAccountId] = useState(client?.metaAdsAccountId || '');
  const [accessToken, setAccessToken] = useState(client?.metaAdsAccessToken || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !accountId || !accessToken) {
      toast.error('Preencha todos os campos');
      return;
    }

    setSaving(true);
    try {
      const url = client?.id ? `/api/admin/clients/${client.id}` : '/api/admin/clients';
      const method = client?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          metaAdsAccountId: accountId,
          metaAdsAccessToken: accessToken,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao salvar');
      }

      toast.success(client?.id ? 'Cliente atualizado!' : 'Cliente criado!');
      onSave();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-[#18191A] border-gray-800 text-white">
      <CardHeader>
        <CardTitle>{client?.id ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
        <CardDescription className="text-gray-400">
          Preencha os dados da conta de anúncios Meta Ads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Nome do Cliente</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Empresa XYZ"
              className="bg-[#242526] border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountId" className="text-gray-300">ID da Conta de Anúncios</Label>
            <Input
              id="accountId"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Ex: 123456789 ou act_123456789"
              className="bg-[#242526] border-gray-700 text-white"
            />
            <p className="text-xs text-gray-500">Formato: número da conta ou act_ seguido do número</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken" className="text-gray-300">Token de Acesso (Access Token)</Label>
            <Input
              id="accessToken"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Cole o token de acesso da Meta Ads"
              className="bg-[#242526] border-gray-700 text-white"
            />
            <p className="text-xs text-gray-500">Token de acesso permanentemente ou de longa duração</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {client?.id ? 'Salvar Alterações' : 'Criar Cliente'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} className="mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}