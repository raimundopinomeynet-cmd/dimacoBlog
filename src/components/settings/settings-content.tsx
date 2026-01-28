'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Key, Save, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyStatus {
  openai: 'unconfigured' | 'configured' | 'testing' | 'valid' | 'invalid';
  gemini: 'unconfigured' | 'configured' | 'testing' | 'valid' | 'invalid';
}

export function SettingsContent() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showOpenai, setShowOpenai] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<ApiKeyStatus>({
    openai: 'unconfigured',
    gemini: 'unconfigured',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setStatus({
          openai: data.hasOpenai ? 'configured' : 'unconfigured',
          gemini: data.hasGemini ? 'configured' : 'unconfigured',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openaiKey: openaiKey || undefined,
          geminiKey: geminiKey || undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Configuracion guardada',
          description: 'Las API keys han sido almacenadas de forma segura.',
          variant: 'success',
        });
        setOpenaiKey('');
        setGeminiKey('');
        loadSettings();
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuracion.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const testApiKey = async (provider: 'openai' | 'gemini') => {
    setStatus((prev) => ({ ...prev, [provider]: 'testing' }));

    try {
      const response = await fetch('/api/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus((prev) => ({ ...prev, [provider]: 'valid' }));
        toast({
          title: 'Conexion exitosa',
          description: `La API key de ${provider === 'openai' ? 'OpenAI' : 'Gemini'} es valida.`,
          variant: 'success',
        });
      } else {
        setStatus((prev) => ({ ...prev, [provider]: 'invalid' }));
        toast({
          title: 'Conexion fallida',
          description: data.error || 'La API key no es valida.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setStatus((prev) => ({ ...prev, [provider]: 'invalid' }));
      toast({
        title: 'Error',
        description: 'No se pudo verificar la API key.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (keyStatus: string) => {
    switch (keyStatus) {
      case 'configured':
        return <Badge variant="secondary">Configurada</Badge>;
      case 'testing':
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Verificando
          </Badge>
        );
      case 'valid':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Valida
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Invalida
          </Badge>
        );
      default:
        return <Badge variant="outline">No configurada</Badge>;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* OpenAI Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Key className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">OpenAI</CardTitle>
                <CardDescription>API key para GPT-4</CardDescription>
              </div>
            </div>
            {getStatusBadge(status.openai)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">API Key</Label>
            <div className="relative">
              <Input
                id="openai-key"
                type={showOpenai ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={status.openai !== 'unconfigured' ? '••••••••••••••••' : 'sk-...'}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10"
                onClick={() => setShowOpenai(!showOpenai)}
              >
                {showOpenai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Obtener en{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>
          {status.openai !== 'unconfigured' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => testApiKey('openai')}
              disabled={status.openai === 'testing'}
            >
              {status.openai === 'testing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar conexion'
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Gemini Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Google Gemini</CardTitle>
                <CardDescription>API key para Gemini</CardDescription>
              </div>
            </div>
            {getStatusBadge(status.gemini)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-key">API Key</Label>
            <div className="relative">
              <Input
                id="gemini-key"
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={status.gemini !== 'unconfigured' ? '••••••••••••••••' : 'AI...'}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10"
                onClick={() => setShowGemini(!showGemini)}
              >
                {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Obtener en{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                aistudio.google.com
              </a>
            </p>
          </div>
          {status.gemini !== 'unconfigured' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => testApiKey('gemini')}
              disabled={status.gemini === 'testing'}
            >
              {status.gemini === 'testing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar conexion'
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="lg:col-span-2">
        <Button
          onClick={handleSave}
          disabled={saving || (!openaiKey && !geminiKey)}
          className="w-full sm:w-auto"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar configuracion
            </>
          )}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="lg:col-span-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Key className="h-4 w-4 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">Seguridad de API Keys</p>
              <p className="text-sm text-blue-700">
                Tus API keys son encriptadas con AES-256 antes de almacenarse. Nunca se muestran en
                texto plano despues de guardarlas. La encriptacion se realiza en el servidor usando
                una clave segura.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
