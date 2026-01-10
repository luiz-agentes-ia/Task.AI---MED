
import React, { useState, createContext, useContext, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Marketing from './components/Marketing';
import Sales from './components/Sales';
import Agenda from './components/Agenda';
import Automation from './components/Automation';
import Financial from './components/Financial';
import Integration from './components/Integration';
import Profile from './components/Profile';
import { AppSection, DateRange } from './types';
import { Menu, X, Zap, ArrowRight, ShieldCheck, Bot } from 'lucide-react';

interface User {
  id: string;
  name: string;
  clinic: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  integrations: Record<string, boolean>;
  metaToken: string | null;
  selectedMetaCampaigns: string[];
  setMetaToken: (token: string | null) => void;
  setSelectedMetaCampaigns: (campaigns: string[]) => void;
  toggleIntegration: (id: string) => void;
  metrics: any;
  updateMetric: (type: 'venda' | 'consulta' | 'lead') => void;
  dateFilter: DateRange;
  setDateFilter: (label: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

const calculateRange = (label: string): DateRange => {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start = new Date();

  switch (label) {
    case 'Hoje':
      start = now;
      break;
    case '7 dias':
      start.setDate(now.getDate() - 7);
      break;
    case '30 dias':
      start.setDate(now.getDate() - 30);
      break;
    case 'Este Ano':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end,
    label: label
  };
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('auth') === 'true');
  const [user, setUser] = useState<User | null>(isAuthenticated ? { id: '1', name: 'Dr. Carlos Eduardo Silva', clinic: 'Clínica Dermato Prime', email: 'carlos@clinica.com', plan: 'pro' } : null);
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [dateFilter, setInternalDateFilter] = useState<DateRange>(calculateRange('30 dias'));
  const [metaToken, setMetaToken] = useState<string | null>(localStorage.getItem('meta_token'));
  const [selectedMetaCampaigns, setSelectedMetaCampaigns] = useState<string[]>(JSON.parse(localStorage.getItem('meta_campaigns') || '[]'));

  const setDateFilter = (label: string) => {
    setInternalDateFilter(calculateRange(label));
  };

  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    'google-ads': false,
    'meta-ads': !!metaToken,
    'wpp': true,
    'sheets': false,
    'calendar': false,
    'crm': false
  });

  const [metrics, setMetrics] = useState({
    leadsTotais: 142,
    conversasIniciadas: 110,
    consultasMarcadas: 64,
    vendas: 12,
    noShow: 12
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token=')) {
      const token = new URLSearchParams(hash.replace('#', '?')).get('access_token');
      if (token) {
        localStorage.setItem('meta_token', token);
        setMetaToken(token);
        setIntegrations(prev => ({ ...prev, 'meta-ads': true }));
        setActiveSection(AppSection.INTEGRACAO);
        window.location.hash = '';
      }
    }
  }, []);

  const login = (email: string) => {
    setUser({ id: '1', name: 'Dr. Carlos Eduardo Silva', clinic: 'Clínica Dermato Prime', email, plan: 'pro' });
    setIsAuthenticated(true);
    localStorage.setItem('auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.clear();
  };

  const toggleIntegration = (id: string) => {
    if (id === 'meta-ads' && integrations[id]) {
      localStorage.removeItem('meta_token');
      localStorage.removeItem('meta_campaigns');
      setMetaToken(null);
      setSelectedMetaCampaigns([]);
    }
    setIntegrations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateMetric = (type: 'venda' | 'consulta' | 'lead') => {
    setIsSyncing(true);
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        leadsTotais: type === 'lead' ? prev.leadsTotais + 1 : prev.leadsTotais,
        consultasMarcadas: type === 'consulta' ? prev.consultasMarcadas + 1 : prev.consultasMarcadas,
        vendas: type === 'venda' ? prev.vendas + 1 : prev.vendas
      }));
      setIsSyncing(false);
    }, 1500);
  };

  const renderContent = () => {
    switch (activeSection) {
      case AppSection.DASHBOARD: return <Dashboard globalMetrics={metrics} />;
      case AppSection.MARKETING: return <Marketing />;
      case AppSection.VENDAS: return <Sales onUpdateMetric={updateMetric} globalMetrics={metrics} />;
      case AppSection.AGENDA: return <Agenda />;
      case AppSection.AUTOMACAO: return <Automation />;
      case AppSection.FINANCEIRO: return <Financial />;
      case AppSection.INTEGRACAO: return <Integration />;
      case AppSection.PERFIL: return <Profile />;
      default: return <Dashboard globalMetrics={metrics} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center">
            <div className="inline-flex p-4 bg-navy text-white rounded-3xl shadow-2xl mb-6"><Bot size={48} /></div>
            <h1 className="text-4xl font-black text-navy tracking-tight">COPILOT AI</h1>
            <p className="text-slate-500 mt-2 font-medium">Automação de gestão para clínicas.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
            <div className="space-y-4">
              <input type="email" placeholder="E-mail" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy focus:outline-none" />
              <input type="password" placeholder="Senha" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy focus:outline-none" />
            </div>
            <button onClick={() => login('carlos@clinica.com')} className="w-full bg-navy text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
              Acessar Painel <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400"><ShieldCheck size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Segurança Bancária Ativa</span></div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, isAuthenticated, login, logout, integrations, metaToken, selectedMetaCampaigns, setMetaToken, setSelectedMetaCampaigns, toggleIntegration, metrics, updateMetric, dateFilter, setDateFilter }}>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">
        <div className="md:hidden flex items-center justify-between p-4 bg-navy text-white z-[60] shadow-md">
          <h1 className="font-bold text-lg tracking-tight">COPILOT AI</h1>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg">{isSidebarOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
        <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:visible transition-all duration-300 ease-in-out`}>
          <Sidebar activeSection={activeSection} onNavigate={(s) => { setActiveSection(s); setSidebarOpen(false); }} />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative">
          <div className="max-w-7xl mx-auto pb-20">{renderContent()}</div>
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;
