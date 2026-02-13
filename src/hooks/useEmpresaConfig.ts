import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmpresaConfig {
  id: string;
  logo_url: string | null;
  nome_empresa: string;
  cnpj: string | null;
  endereco: string | null;
}

export function useEmpresaConfig() {
  const [config, setConfig] = useState<EmpresaConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('empresa_config')
      .select('*')
      .limit(1)
      .single();

    if (!error && data) {
      setConfig(data as EmpresaConfig);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (updates: Partial<EmpresaConfig>) => {
    if (!config) return { error: new Error('No config found') };

    const { data, error } = await supabase
      .from('empresa_config')
      .update(updates)
      .eq('id', config.id)
      .select()
      .single();

    if (!error && data) {
      setConfig(data as EmpresaConfig);
    }
    return { data, error };
  };

  const uploadLogo = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) return { error: uploadError };

    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    const logoUrl = urlData.publicUrl;
    const { error: updateError } = await updateConfig({ logo_url: logoUrl });

    if (!updateError) {
      setConfig(prev => prev ? { ...prev, logo_url: logoUrl } : prev);
    }

    return { error: updateError, url: logoUrl };
  };

  return { config, loading, updateConfig, uploadLogo, refetch: fetchConfig };
}
