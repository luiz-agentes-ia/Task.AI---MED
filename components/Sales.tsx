
import React, { useState, useMemo } from 'react';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Search, 
  Send, 
  Filter, 
  Bot,
  User,
  Users,
  Zap,
  Calendar,
  ChevronRight,
  TrendingUp,
  Target,
  ArrowRight,
  Sparkles,
  Loader2,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  Repeat,
  MousePointer2,
  Percent,
  TrendingDown,
  HandCoins,
  Receipt,
  History,
  TrendingUpDown,
  ShoppingBag,
  Flame,
  ArrowDownRight,
  UserX,
  Stethoscope,
  Activity,
  Layers,
  Timer,
  BarChart3,
  Network
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { analyzeLeadConversation } from '../services/geminiService';
import { useApp } from '../App';

interface SalesProps {
  globalMetrics: {
    leadsTotais: number;
    conversasIniciadas: number;
    consultasMarcadas: number;
    vendas: number;
    noShow: number;
  };
  onUpdateMetric: (type: 'venda' | 'consulta' | 'lead') => void;
}

interface Lead {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  status: 'Novo' | 'Conversa' | 'Consulta' | 'No Show' | 'Venda';
  unread?: number;
  phone: string;
  temperature: 'Hot' | 'Warm' | 'Cold';
  history: string;
  potentialValue: number;
  lastInteraction: string;
}

const mockLeads: Lead[] = [
  { id: 1, name: 'Beatriz Santos', lastMessage: 'Gostaria de saber o valor da bichectomia', time: '10:15', status: 'Novo', unread: 2, phone: '(11) 98765-4321', temperature: 'Hot', history: "Lead: Olá! Vi um anúncio sobre bichectomia. Qual o valor? \nSecretária: Olá Beatriz! O valor depende da avaliação. Você já fez algum procedimento facial?", potentialValue: 3500, lastInteraction: '5 min' },
  { id: 2, name: 'Marcos Oliveira', lastMessage: 'Pode confirmar meu horário para amanhã?', time: '09:45', status: 'Consulta', phone: '(11) 91234-5678', temperature: 'Warm', history: "Lead: Pode confirmar meu horário? \nSecretária: Confirmado para amanhã às 10h!", potentialValue: 1200, lastInteraction: '2h' },
  { id: 3, name: 'Ana Paula Rego', lastMessage: 'Vou falar com meu marido e te aviso', time: 'Ontem', status: 'Conversa', phone: '(11) 95555-4444', temperature: 'Warm', history: "Secretária: O orçamento ficou R$ 2500. \nLead: Vou falar com meu marido e te aviso.", potentialValue: 2500, lastInteraction: '1d' },
];

const Sales: React.FC<SalesProps> = ({ globalMetrics, onUpdateMetric }) => {
  const { dateFilter, setDateFilter } = useApp();
  const [activeLead, setActiveLead] = useState<Lead>(mockLeads[0]);
  const [activeTab, setActiveTab] = useState<'chat' | 'stats'>('stats');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const stats = useMemo(() => {
    let multiplier = 1;
    if (dateFilter.label === 'Hoje') multiplier = 0.1;
    if (dateFilter.label === '7 dias') multiplier = 0.3;
    if (dateFilter.label === 'Este Ano') multiplier = 4.5;

    const leadsTotais = Math.round(globalMetrics.leadsTotais * multiplier);
    const conversasIniciadas = Math.round(globalMetrics.conversasIniciadas * multiplier);
    const consultasMarcadas = Math.round(globalMetrics.consultasMarcadas * multiplier);
    const vendas = Math.round(globalMetrics.vendas * multiplier);
    const noShow = Math.round(globalMetrics.noShow * multiplier);

    const leadsRespondidosPct = (conversasIniciadas / (leadsTotais || 1)) * 100;
    const taxaCDCPct = (consultasMarcadas / (leadsTotais || 1)) * 100;
    
    const faturamentoTotal = vendas * 7700;
    const investimentoTotal = 7680 * (multiplier > 1 ? multiplier * 0.7 : multiplier);
    const custoPorVenda = vendas > 0 ? investimentoTotal / vendas : 0;
    const leadsEmFollowUp = Math.round(leadsTotais * 0.46);
    
    const noShowPct = (noShow / (consultasMarcadas || 1)) * 100;
    const consultasFeitas = consultasMarcadas - noShow;

    const followUpIniciados = Math.round(leadsEmFollowUp * 0.82);
    const followUpConvertidos = Math.round(followUpIniciados * 0.45);
    const taxaSucessoFollowUp = (followUpConvertidos / (followUpIniciados || 1)) * 100;

    return {
      leadsTotal: leadsTotais,
      tempoResposta: '12 min',
      leadsRespondidosPct,
      conversaoConsultaNum: consultasMarcadas,
      noShowPct,
      consultasFeitas,
      taxaCDCPct,
      leadsEmFollowUp,
      vendasTotal: vendas,
      custoPorVenda,
      faturamentoTotal,
      followUp: {
        iniciados: followUpIniciados,
        sucessoPct: taxaSucessoFollowUp,
        tempoMedioConversao: '3.8 Dias',
        estagios: {
          reativacao: Math.round(followUpIniciados * 0.5),
          negociacao: Math.round(followUpIniciados * 0.3),
          fechamento: Math.round(followUpIniciados * 0.2)
        }
      }
    };
  }, [globalMetrics, dateFilter]);

  const revenueChartData = useMemo(() => [
    { name: 'Seg', faturamento: 12400, leads: 15 },
    { name: 'Ter', faturamento: 15800, leads: 22 },
    { name: 'Qua', faturamento: 9200, leads: 18 },
    { name: 'Qui', faturamento: 21000, leads: 25 },
    { name: 'Sex', faturamento: 18500, leads: 20 },
    { name: 'Sáb', faturamento: 8400, leads: 10 },
    { name: 'Dom', faturamento: 4200, leads: 8 },
  ], []);

  const handleAnalyzeLead = async () => {
    setIsAnalyzing(true);
    const result = await analyzeLeadConversation(activeLead.name, activeLead.history);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-semibold text-navy tracking-tight">Funil de Vendas & Inteligência</h2>
          <div className="flex items-center gap-2">
            <p className="text-slate-500 text-sm font-light">Monitoramento ativo de conversão e faturamento.</p>
            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> LIVE SALES ENGINE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            {['Hoje', '7 dias', '30 dias', 'Este Ano'].map((t) => (
              <button 
                key={t} 
                onClick={() => setDateFilter(t)}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${t === dateFilter.label ? 'bg-navy text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setActiveTab('stats')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'stats' ? 'bg-navy text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Métricas de Vendas</button>
            <button onClick={() => setActiveTab('chat')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'chat' ? 'bg-navy text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Leads WhatsApp</button>
          </div>
        </div>
      </header>

      {activeTab === 'chat' ? (
        <div className="flex-1 flex gap-6 min-h-0 animate-in fade-in duration-300 overflow-hidden pb-10">
          <div className="w-80 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Pesquisar..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none font-medium" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {mockLeads.map((lead) => (
                <button key={lead.id} onClick={() => setActiveLead(lead)} className={`w-full p-4 flex gap-3 border-b border-slate-50 transition-all text-left hover:bg-slate-50/80 ${activeLead.id === lead.id ? 'bg-slate-50 border-l-4 border-l-navy' : 'border-l-4 border-l-transparent'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeLead.id === lead.id ? 'bg-navy text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {lead.temperature === 'Hot' ? <Flame size={20} className="text-orange-500" /> : <User size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="text-xs font-semibold text-navy truncate">{lead.name}</h4>
                      <span className="text-[9px] text-slate-400 font-medium">{lead.lastInteraction}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mb-1.5 font-light">{lead.lastMessage}</p>
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${lead.temperature === 'Hot' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{lead.temperature}</span>
                       <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">R$ {lead.potentialValue}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-white shrink-0"><User size={20} /></div>
                <div><h3 className="font-semibold text-navy text-sm leading-tight">{activeLead.name}</h3><span className="text-[9px] text-emerald-500 font-bold tracking-widest uppercase">Lead com Alta Intenção</span></div>
              </div>
              <button onClick={handleAnalyzeLead} disabled={isAnalyzing} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100">
                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Raio-X da IA
              </button>
            </div>
            <div className="flex-1 bg-slate-50/50 p-6 overflow-y-auto">
               <div className="max-w-[70%] bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed font-light">{activeLead.lastMessage}</p>
                </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
              <input type="text" placeholder="Escreva sua mensagem..." className="flex-1 pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none" />
              <button className="p-3 bg-navy text-white rounded-xl shadow-lg hover:scale-105 transition-all"><Send size={20} /></button>
            </div>
          </div>
        </div>
      ) : (
        /* ABA DE MÉTRICAS COMPLETA */
        <div className="space-y-8 overflow-y-auto pr-2 pb-20 animate-in fade-in duration-300 custom-scrollbar">
          
          {/* GRADE DE 9 KPIs PRINCIPAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-400 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={18} /></div>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Leads (Volume Total)</span>
              </div>
              <div><p className="text-2xl font-bold text-navy tracking-tight">{stats.leadsTotal}</p><p className="text-[9px] text-slate-400 mt-2 font-medium uppercase italic tracking-wider">Demanda Gerada</p></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-indigo-400 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg"><Clock size={18} /></div>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Tempo de Resposta</span>
              </div>
              <div><p className="text-2xl font-bold text-navy tracking-tight">{stats.tempoResposta}</p><p className="text-[9px] text-emerald-500 mt-2 font-medium uppercase italic tracking-wider">Agilidade de Venda</p></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-emerald-400 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg"><MessageCircle size={18} /></div>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Leads Respondidos (%)</span>
              </div>
              <div><p className="text-2xl font-bold text-navy tracking-tight">{stats.leadsRespondidosPct.toFixed(1)}%</p><p className="text-[9px] text-emerald-500 mt-2 font-medium uppercase italic tracking-wider">Engajamento Inicial</p></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-500 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Target size={18} /></div>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Conversão para Consulta</span>
              </div>
              <div><p className="text-2xl font-bold text-navy tracking-tight">{stats.conversaoConsultaNum}</p><p className="text-[9px] text-slate-400 mt-2 font-medium uppercase italic tracking-wider">Agendamento Efetivo</p></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-indigo-500 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><TrendingUpDown size={18} /></div>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Taxa de CDC (%)</span>
              </div>
              <div><p className="text-2xl font-bold text-navy tracking-tight">{stats.taxaCDCPct.toFixed(1)}%</p><p className="text-[9px] text-indigo-600 mt-2 font-medium uppercase italic tracking-wider">Leads x Agendamentos</p></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-amber-400 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle size={18} /></div>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Leads em Follow Up</span>
              </div>
              <div><p className="text-2xl font-bold text-navy tracking-tight">{stats.leadsEmFollowUp}</p><p className="text-[9px] text-amber-600 mt-2 font-medium uppercase italic tracking-wider">Oportunidades no Limbo</p></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-emerald-500 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg"><CheckCircle2 size={18} /></div>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Vendas de Tratamento</span>
              </div>
              <div><p className="text-2xl font-bold text-navy tracking-tight">{stats.vendasTotal}</p><p className="text-[9px] text-emerald-500 mt-2 font-medium uppercase italic tracking-wider">Contratos Fechados</p></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-rose-400 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><HandCoins size={18} /></div>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Custo por Venda (CPV)</span>
              </div>
              <div><p className="text-2xl font-bold text-navy tracking-tight">R$ {stats.custoPorVenda.toFixed(2)}</p><p className="text-[9px] text-rose-500 mt-2 font-medium uppercase italic tracking-wider">CAC Final</p></div>
            </div>

            <div className="bg-navy p-6 rounded-2xl text-white shadow-xl relative overflow-hidden ring-1 ring-white/10">
              <Receipt size={60} className="absolute -right-4 -bottom-4 text-white/5" />
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="p-2 bg-white/10 text-white rounded-lg"><DollarSign size={18} /></div>
                <span className="text-[9px] font-medium text-blue-300 uppercase tracking-widest">Faturamento Total</span>
              </div>
              <div className="relative z-10">
                <p className="text-2xl font-bold tracking-tight leading-none">R$ {stats.faturamentoTotal.toLocaleString('pt-BR')}</p>
                <p className="text-[9px] text-emerald-400 mt-2 font-bold uppercase tracking-tight">Resultado Bruto via Vendas</p>
              </div>
            </div>
          </div>

          {/* OPORTUNIDADES ABERTAS & PERFORMANCE DE FOLLOW-UP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* OPORTUNIDADES ABERTAS */}
            <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group">
               <div className="absolute -right-12 -bottom-12 opacity-5 text-indigo-900 group-hover:scale-110 transition-transform"><DollarSign size={200} /></div>
               
               <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm"><ArrowUpRight size={24} /></div>
                    <div>
                      <h3 className="text-xl font-semibold text-navy">Oportunidades Abertas</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Receita "Travada" Aguardando Ação</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-indigo-200">Potencial de Recuperação</span>
               </div>

               <div className="space-y-8">
                  <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-bold text-navy tracking-tighter">R$ {(stats.leadsEmFollowUp * 2500).toLocaleString('pt-BR')}</span>
                     <span className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em]">em caixa futuro</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Leads Quentes</p>
                      <p className="text-xl font-bold text-navy">{Math.round(stats.leadsEmFollowUp * 0.4)} Pacientes</p>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1">Conversão Provável</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Follow-ups Atrasados</p>
                      <p className="text-xl font-bold text-rose-600">{Math.round(stats.leadsEmFollowUp * 0.6)} Pacientes</p>
                      <p className="text-[9px] font-bold text-rose-500 uppercase mt-1">Ação Urgente</p>
                    </div>
                  </div>

                  <div className="bg-navy p-7 rounded-[32px] text-white relative overflow-hidden group/btn cursor-pointer hover:scale-[1.01] transition-all shadow-2xl shadow-navy/20">
                     <div className="absolute right-0 top-0 p-4 opacity-10"><Zap size={40} /></div>
                     <div className="flex justify-between items-center relative z-10">
                        <div className="flex-1 pr-4">
                           <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Sparkles size={12} /> Plano de Recuperação IA
                           </p>
                           <p className="text-sm font-light italic text-slate-200 leading-relaxed">
                              "Priorize os {Math.round(stats.leadsEmFollowUp * 0.4)} leads quentes para recuperar **R$ {Math.round(stats.leadsEmFollowUp * 0.4 * 3500).toLocaleString()}** nas próximas 48h."
                           </p>
                        </div>
                        <div className="p-4 bg-white text-navy rounded-2xl shadow-lg"><ArrowRight size={20} /></div>
                     </div>
                  </div>
               </div>
            </div>

            {/* PERFORMANCE DE FOLLOW-UP */}
            <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm flex flex-col group">
               <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm"><Network size={24} /></div>
                    <div>
                      <h3 className="text-xl font-semibold text-navy">Performance de Follow-up</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Gestão da Jornada de Recuperação</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider block">
                      {stats.followUp.sucessoPct.toFixed(1)}% Sucesso
                    </span>
                    <p className="text-[8px] font-medium text-slate-400 mt-1 uppercase">Iniciados x Convertidos</p>
                  </div>
               </div>

               <div className="space-y-8 flex-1 flex flex-col">
                  {/* MÉTRICAS DE TOPO DO CARD */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-all">
                        <div className="flex items-center gap-2 mb-1 text-slate-400"><Activity size={14} /> <span className="text-[9px] font-bold uppercase">Follow-ups Ativos</span></div>
                        <p className="text-xl font-bold text-navy tracking-tight">{stats.followUp.iniciados} Pacientes</p>
                        <p className="text-[8px] font-medium text-blue-500 mt-1 uppercase tracking-tighter">Iniciaram o fluxo</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-all">
                        <div className="flex items-center gap-2 mb-1 text-slate-400"><Timer size={14} /> <span className="text-[9px] font-bold uppercase">1ª Msg → Venda</span></div>
                        <p className="text-xl font-bold text-navy tracking-tight">{stats.followUp.tempoMedioConversao}</p>
                        <p className="text-[8px] font-medium text-emerald-500 mt-1 uppercase tracking-tighter">Ciclo de Recuperação</p>
                     </div>
                  </div>

                  {/* DETALHAMENTO DAS ETAPAS */}
                  <div className="space-y-5 flex-1 pt-2">
                     <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline de Recuperação</span>
                        <span className="text-[10px] font-medium text-navy uppercase italic">Total: {stats.followUp.iniciados}</span>
                     </div>
                     
                     <div className="space-y-5">
                        <div className="group/stage bg-slate-50/50 p-4 rounded-2xl border border-slate-50 hover:border-blue-100 transition-all">
                           <div className="flex justify-between text-[11px] mb-2 font-medium">
                              <span className="text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Reativados (Primeiro Contato)</span>
                              <span className="text-navy font-semibold">{stats.followUp.estagios.reativacao} leads</span>
                           </div>
                           <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-blue-400 h-full w-[50%] transition-all duration-700"></div>
                           </div>
                        </div>

                        <div className="group/stage bg-slate-50/50 p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 transition-all">
                           <div className="flex justify-between text-[11px] mb-2 font-medium">
                              <span className="text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Em Negociação (Objeções)</span>
                              <span className="text-navy font-semibold">{stats.followUp.estagios.negociacao} leads</span>
                           </div>
                           <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-400 h-full w-[30%] transition-all duration-700"></div>
                           </div>
                        </div>

                        <div className="group/stage bg-slate-50/50 p-4 rounded-2xl border border-slate-50 hover:border-emerald-100 transition-all">
                           <div className="flex justify-between text-[11px] mb-2 font-medium">
                              <span className="text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Decisão Final (Aguardando)</span>
                              <span className="text-navy font-semibold">{stats.followUp.estagios.fechamento} leads</span>
                           </div>
                           <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-400 h-full w-[20%] transition-all duration-700"></div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                     <div className="flex justify-between items-center mb-5">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sucesso Total de Recuperação</span>
                           <span className="text-[8px] font-medium text-emerald-500 uppercase mt-1">Meta: 50% de sucesso</span>
                        </div>
                        <span className="text-lg font-bold text-navy">{stats.followUp.sucessoPct.toFixed(1)}%</span>
                     </div>
                     <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-1000 ease-out" 
                          style={{ width: `${stats.followUp.sucessoPct}%` }}
                        ></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* GRÁFICO DE FATURAMENTO */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h3 className="text-xl font-semibold text-navy">Inteligência de Receita</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Correlação entre Leads, Conversão e Faturamento</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-600"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Faturamento (R$)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-indigo-400"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Leads (Vol)</span></div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: '#94a3b8' }} tickFormatter={(val) => `R$${val/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="faturamento" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="leads" stroke="#818cf8" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RESUMO DE FLUXO */}
          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-12">
               <div>
                  <h3 className="text-xl font-semibold text-navy">Resumo do Fluxo Comercial</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Análise de eficiência entre etapas e gargalos de conversão</p>
               </div>
               <span className="text-[10px] bg-slate-900 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest">Live Flow</span>
            </div>

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-4">
               {/* ETAPA 1: LEADS */}
               <div className="flex-1 w-full flex flex-col items-center group">
                  <div className="w-full p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center transition-all group-hover:bg-white group-hover:shadow-xl">
                     <Users size={20} className="text-slate-400 mb-3" />
                     <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">Leads Totais</span>
                     <p className="text-2xl font-bold text-navy tracking-tight">{stats.leadsTotal}</p>
                  </div>
               </div>

               <div className={`flex items-center justify-center p-2 rounded-full ${stats.leadsRespondidosPct < 70 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  <ArrowRight size={24} />
               </div>

               {/* ETAPA 2: CONVERSAS */}
               <div className="flex-1 w-full flex flex-col items-center group">
                  <div className={`w-full p-6 rounded-3xl border flex flex-col items-center transition-all group-hover:shadow-xl ${stats.leadsRespondidosPct < 70 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100 group-hover:bg-white'}`}>
                     <MessageCircle size={20} className={stats.leadsRespondidosPct < 70 ? 'text-rose-500' : 'text-slate-400'} />
                     <span className={`text-[9px] font-bold uppercase mb-1 ${stats.leadsRespondidosPct < 70 ? 'text-rose-500' : 'text-slate-400'}`}>Conversas</span>
                     <p className="text-2xl font-bold text-navy tracking-tight">{Math.round(stats.leadsTotal * (stats.leadsRespondidosPct / 100))}</p>
                     <span className={`text-[10px] font-bold mt-2 ${stats.leadsRespondidosPct < 70 ? 'text-rose-600' : 'text-emerald-500'}`}>{stats.leadsRespondidosPct.toFixed(1)}%</span>
                  </div>
               </div>

               <div className={`flex items-center justify-center p-2 rounded-full ${stats.taxaCDCPct < 40 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  <ArrowRight size={24} />
               </div>

               {/* ETAPA 3: MARCADA */}
               <div className="flex-1 w-full flex flex-col items-center group">
                  <div className={`w-full p-6 rounded-3xl border flex flex-col items-center transition-all group-hover:shadow-xl ${stats.taxaCDCPct < 40 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100 group-hover:bg-white'}`}>
                     <Calendar size={20} className={stats.taxaCDCPct < 40 ? 'text-rose-500' : 'text-slate-400'} />
                     <span className={`text-[9px] font-bold uppercase mb-1 ${stats.taxaCDCPct < 40 ? 'text-rose-500' : 'text-slate-400'}`}>Agendadas</span>
                     <p className="text-2xl font-bold text-navy tracking-tight">{stats.conversaoConsultaNum}</p>
                     <span className={`text-[10px] font-bold mt-2 ${stats.taxaCDCPct < 40 ? 'text-rose-600' : 'text-emerald-500'}`}>{stats.taxaCDCPct.toFixed(1)}%</span>
                  </div>
               </div>

               <div className={`flex items-center justify-center p-2 rounded-full ${stats.noShowPct > 20 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  <ArrowDownRight size={24} />
               </div>

               {/* ETAPA 4: NO SHOW */}
               <div className="flex-1 w-full flex flex-col items-center group">
                  <div className={`w-full p-6 rounded-3xl border flex flex-col items-center transition-all group-hover:shadow-xl ${stats.noShowPct > 20 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                     <UserX size={20} className={stats.noShowPct > 20 ? 'text-rose-500' : 'text-slate-400'} />
                     <span className={`text-[9px] font-bold uppercase mb-1 ${stats.noShowPct > 20 ? 'text-rose-500' : 'text-slate-400'}`}>No Show</span>
                     <p className={`text-2xl font-bold ${stats.noShowPct > 20 ? 'text-rose-600' : 'text-navy'} tracking-tight`}>{Math.round(stats.conversaoConsultaNum * (stats.noShowPct/100))}</p>
                     <span className={`text-[10px] font-bold mt-2 ${stats.noShowPct > 20 ? 'text-rose-600' : 'text-slate-400'}`}>{stats.noShowPct.toFixed(1)}%</span>
                  </div>
               </div>

               <div className="flex items-center justify-center p-2 rounded-full text-slate-200">
                  <ArrowRight size={24} />
               </div>

               {/* ETAPA 5: FEITAS */}
               <div className="flex-1 w-full flex flex-col items-center group">
                  <div className="w-full p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex flex-col items-center transition-all group-hover:bg-white group-hover:shadow-xl">
                     <Stethoscope size={20} className="text-emerald-500 mb-3" />
                     <span className="text-[9px] font-bold text-emerald-600 uppercase mb-1">Realizadas</span>
                     <p className="text-2xl font-bold text-navy tracking-tight">{stats.consultasFeitas}</p>
                     <span className="text-[10px] font-medium text-emerald-600 mt-2">Pronto p/ Venda</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;