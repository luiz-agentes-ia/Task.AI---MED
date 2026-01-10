
import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  MessageCircle, 
  FileSpreadsheet, 
  Database, 
  CheckCircle2, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  Lock,
  ArrowRight,
  Loader2,
  X,
  Plus
} from 'lucide-react';
import { useApp } from '../App';
import { getMetaAdAccounts, getMetaCampaigns } from '../services/metaService';
import { MetaAdAccount, MetaCampaign } from '../types';

const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c3.11 0 5.71-1.03 7.61-2.81l-3.57-2.77c-.99.66-2.26 1.06-4.04 1.06-3.41 0-6.3-2.3-7.34-5.41H1.04v2.81C3.12 19.38 7.3 23 12 23z" fill="#34A853"/>
    <path d="M4.66 14.07c-.26-.77-.41-1.6-.41-2.47s.15-1.7.41-2.47V6.32H1.04C.38 7.64 0 9.13 0 10.7c0 1.57.38 3.06 1.04 4.38l3.62-2.81z" fill="#FBBC05"/>
    <path d="M12 4.19c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.71 1.03 15.11 0 12 0 7.3 0 3.12 3.62 1.04 8.07l3.62 2.81c1.04-3.11 3.93-5.41 7.34-5.41z" fill="#EA4335"/>
  </svg>
);

const Integration: React.FC = () => {
  const { integrations, toggleIntegration, metaToken, selectedMetaCampaigns, setSelectedMetaCampaigns } = useApp();
  const [loading, setLoading] = useState(false);
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showCampaignSelector, setShowCampaignSelector] = useState(false);

  // Se estiver logado no Meta, busca contas
  useEffect(() => {
    if (metaToken) {
      setLoading(true);
      getMetaAdAccounts(metaToken)
        .then(accounts => {
          setAdAccounts(accounts);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [metaToken]);

  const handleMetaLogin = () => {
    const clientId = 'SEU_APP_ID_AQUI'; // Insira seu App ID do Meta
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'ads_read,ads_management,business_management';
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=token`;
    
    window.location.href = authUrl;
  };

  const handleSelectAccount = async (id: string) => {
    setSelectedAccount(id);
    setLoading(true);
    try {
      const camps = await getMetaCampaigns(id, metaToken!);
      setCampaigns(camps);
      setShowCampaignSelector(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaignSelection = (id: string) => {
    const newSelection = selectedMetaCampaigns.includes(id)
      ? selectedMetaCampaigns.filter(c => c !== id)
      : [...selectedMetaCampaigns, id];
    setSelectedMetaCampaigns(newSelection);
    localStorage.setItem('meta_campaigns', JSON.stringify(newSelection));
  };

  const integrationList = [
    { id: 'google-ads', name: 'Google Ads', icon: <GoogleIcon size={24} /> },
    { id: 'meta-ads', name: 'Meta Ads', icon: <Instagram className="text-pink-600" /> },
    { id: 'wpp', name: 'WhatsApp Business', icon: <MessageCircle className="text-emerald-500" /> },
    { id: 'calendar', name: 'Google Calendar', icon: <Calendar className="text-amber-500" /> },
    { id: 'sheets', name: 'Google Sheets', icon: <FileSpreadsheet className="text-emerald-600" /> },
    { id: 'crm', name: 'CRM (Doctoralia)', icon: <Database className="text-indigo-500" /> },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-navy">Integrações Reais</h2>
        <p className="text-slate-500 text-sm">Conecte suas contas oficiais para alimentar a inteligência do Copiloto.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationList.map((item) => (
          <div key={item.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col group hover:border-navy transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-navy group-hover:text-white transition-colors">{item.icon}</div>
              {integrations[item.id] ? (
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase border border-emerald-100"><CheckCircle2 size={12} /> Ativo</span>
              ) : (
                <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-3 py-1.5 rounded-full uppercase border border-slate-100">Pendente</span>
              )}
            </div>
            <h3 className="font-black text-navy text-sm uppercase tracking-widest">{item.name}</h3>
            
            {item.id === 'meta-ads' && metaToken ? (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] text-emerald-500 font-bold uppercase">CONECTADO: {adAccounts.length} CONTAS ENCONTRADAS</p>
                <select 
                  onChange={(e) => handleSelectAccount(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-navy focus:outline-none"
                >
                  <option>Selecionar Conta de Anúncios...</option>
                  {adAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
                <button onClick={() => toggleIntegration('meta-ads')} className="w-full mt-4 py-3 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 rounded-xl transition-all">Desconectar Conta</button>
              </div>
            ) : (
              <button 
                onClick={() => item.id === 'meta-ads' ? handleMetaLogin() : toggleIntegration(item.id)}
                disabled={loading}
                className="mt-8 w-full py-4 bg-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Conectar Agora'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* SELETOR DE CAMPANHAS MODAL */}
      {showCampaignSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-navy">Selecione as Campanhas</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Escolha quais dados o Copiloto deve monitorar</p>
              </div>
              <button onClick={() => setShowCampaignSelector(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X size={24} /></button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-3">
              {campaigns.map(camp => (
                <div 
                  key={camp.id} 
                  onClick={() => toggleCampaignSelection(camp.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedMetaCampaigns.includes(camp.id) ? 'border-navy bg-navy/5 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMetaCampaigns.includes(camp.id) ? 'bg-navy text-white' : 'bg-slate-100 text-slate-400'}`}><Zap size={18} /></div>
                    <div>
                      <h4 className="text-sm font-black text-navy">{camp.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{camp.objective} • {camp.status}</p>
                    </div>
                  </div>
                  {selectedMetaCampaigns.includes(camp.id) && <CheckCircle2 size={24} className="text-navy" />}
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase">{selectedMetaCampaigns.length} Campanhas Selecionadas</span>
              <button onClick={() => setShowCampaignSelector(false)} className="bg-navy text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Confirmar Seleção</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-navy p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5"><Lock size={200} /></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center border border-blue-500/30 shrink-0"><ShieldCheck size={40} className="text-blue-400" /></div>
          <div className="flex-1 text-center lg:text-left">
            <h4 className="text-2xl font-bold mb-3">Conexão Oficial Via Meta API</h4>
            <p className="text-slate-400 leading-relaxed max-w-3xl font-medium">Sua conta é conectada de forma segura. O Copiloto AI não armazena sua senha, apenas tokens de acesso para leitura de métricas, em conformidade com as políticas da Meta.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integration;
