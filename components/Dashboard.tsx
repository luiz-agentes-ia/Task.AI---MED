
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  UserCheck, 
  UserX, 
  Stethoscope, 
  DollarSign, 
  CreditCard, 
  Briefcase,
  AlertTriangle,
  Zap,
  Megaphone,
  Target,
  HandCoins,
  MousePointer2,
  TrendingDown,
  Calendar,
  Info
} from 'lucide-react';
import { getAIInsights, generateAudioReport, playPCM } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';
import { useApp } from '../App';

interface DashboardProps {
  globalMetrics: {
    leadsTotais: number;
    conversasIniciadas: number;
    consultasMarcadas: number;
    vendas: number;
    noShow: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ globalMetrics }) => {
  const { dateFilter, setDateFilter } = useApp();
  const [insight, setInsight] = useState<string>('Analisando sua clínica...');
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [revenueRange, setRevenueRange] = useState<'7d' | '15d' | '30d' | 'custom'>('7d');

  const filteredMetrics = useMemo(() => {
    let multiplier = 1;
    if (dateFilter.label === 'Hoje') multiplier = 0.1;
    if (dateFilter.label === '7 dias') multiplier = 0.3;
    if (dateFilter.label === 'Este Ano') multiplier = 4.5;

    const leads = Math.round(globalMetrics.leadsTotais * multiplier);
    const consultas = Math.round(globalMetrics.consultasMarcadas * multiplier);
    const vendas = Math.round(globalMetrics.vendas * multiplier);
    const gastosTotais = Math.round(51200 * (multiplier > 1 ? multiplier * 0.7 : multiplier));
    const mktSpend = gastosTotais * 0.15;

    return {
      leadsTotais: leads,
      consultasMarcadas: consultas,
      vendas: vendas,
      receita: Math.round(vendas * 7700),
      gastos: gastosTotais,
      mktSpend: mktSpend,
      cpl: leads > 0 ? mktSpend / leads : 0,
      cac: consultas > 0 ? mktSpend / consultas : 0,
      cpv: vendas > 0 ? mktSpend / vendas : 0
    };
  }, [globalMetrics, dateFilter]);

  const chartStats = useMemo(() => {
    let multiplier = 1;
    if (revenueRange === '7d') multiplier = 7/30;
    else if (revenueRange === '15d') multiplier = 15/30;
    else if (revenueRange === '30d') multiplier = 1;
    else if (revenueRange === 'custom') multiplier = 12; 

    const vendas = Math.round(globalMetrics.vendas * multiplier);
    const receitaTotal = Math.round(vendas * 7700);
    const gastoMkt = Math.round(7680 * multiplier);
    const cpv = vendas > 0 ? gastoMkt / vendas : 0;

    return {
      faturamento: receitaTotal,
      vendas: vendas,
      cpv: cpv,
      gasto: gastoMkt
    };
  }, [revenueRange, globalMetrics]);

  const revenueTrendData = useMemo(() => {
    const data = [];
    let points = 7;
    if (revenueRange === '7d') points = 7;
    else if (revenueRange === '15d') points = 15;
    else if (revenueRange === '30d') points = 30;
    else if (revenueRange === 'custom') points = 12;

    const baseRevenue = chartStats.faturamento / points;
    
    for (let i = 0; i < points; i++) {
      const randomVar = 0.85 + Math.random() * 0.3;
      const label = revenueRange === 'custom' 
        ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i]
        : `${i + 1}/${new Date().getMonth() + 1}`;
      
      data.push({
        name: label,
        revenue: Math.round(baseRevenue * randomVar * (1 + (i / points) * 0.4))
      });
    }
    return data;
  }, [revenueRange, chartStats.faturamento]);

  const funnelData = [
    { name: 'Leads', value: filteredMetrics.leadsTotais, fill: '#0f172a' },
    { name: 'Agendados', value: filteredMetrics.consultasMarcadas, fill: '#334155' },
    { name: 'Compareceram', value: Math.round(filteredMetrics.consultasMarcadas * 0.82), fill: '#475569' },
    { name: 'Convertidos', value: filteredMetrics.vendas, fill: '#10b981' },
  ];

  useEffect(() => {
    const loadInsight = async () => {
      const res = await getAIInsights({ filteredMetrics, period: dateFilter.label });
      setInsight(res);
    };
    loadInsight();
  }, [filteredMetrics, dateFilter.label]);

  const handlePlayAudio = async () => {
    setLoadingAudio(true);
    const audioData = await generateAudioReport(insight);
    if (audioData) {
      await playPCM(audioData);
    }
    setLoadingAudio(false);
  };

  const kpis = [
    { label: 'INVESTIMENTO (MARKETING)', value: `R$ ${filteredMetrics.mktSpend.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, trend: '+5%', icon: <Megaphone className="text-blue-500" size={18} /> },
    { label: 'LEADS NO PERÍODO', value: filteredMetrics.leadsTotais.toString(), trend: '+8%', icon: <Users className="text-indigo-500" size={18} /> },
    { label: 'CPL (CUSTO POR LEAD)', value: `R$ ${filteredMetrics.cpl.toFixed(2)}`, trend: '-R$ 2,10', icon: <Target className="text-blue-400" size={18} /> },
    { label: 'CONSULTAS MARCADAS', value: filteredMetrics.consultasMarcadas.toString(), trend: '+12%', icon: <CalendarCheck className="text-blue-600" size={18} /> },
    { label: 'COMPARECIMENTO', value: '82%', trend: '+4%', icon: <UserCheck className="text-emerald-500" size={18} /> },
    { label: 'CAC (CUSTO AQUIS. CONSULTA)', value: `R$ ${filteredMetrics.cac.toFixed(2)}`, trend: 'Meta: R$ 45', icon: <Zap className="text-amber-500" size={18} /> },
    { label: 'FALTAS (NO-SHOW)', value: '18%', trend: '-5%', icon: <UserX className="text-rose-500" size={18} />, trendNegative: true },
    { label: 'VENDAS DE TRATAMENTO', value: filteredMetrics.vendas.toString(), trend: '+15%', icon: <Stethoscope className="text-purple-500" size={18} /> },
    { label: 'RECEITA BRUTA', value: `R$ ${filteredMetrics.receita.toLocaleString()}`, trend: '+12%', icon: <DollarSign className="text-emerald-600" size={18} /> },
    { label: 'CPV (CUSTO POR VENDA)', value: `R$ ${filteredMetrics.cpv.toFixed(2)}`, trend: 'Eficiente', icon: <HandCoins className="text-indigo-600" size={18} /> },
    { label: 'GASTOS TOTAIS', value: `R$ ${filteredMetrics.gastos.toLocaleString()}`, trend: '+2%', icon: <CreditCard className="text-rose-500" size={18} /> },
    { label: 'LUCRO LÍQUIDO (EST.)', value: `R$ ${(filteredMetrics.receita - filteredMetrics.gastos).toLocaleString()}`, trend: '+10%', icon: <Briefcase className="text-navy" size={18} />, isMain: true },
  ];

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-navy tracking-tight">Resumo Executivo</h2>
          <p className="text-slate-500 text-sm font-light">Dados consolidados de {dateFilter.start} até {dateFilter.end}</p>
        </div>
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
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
      </header>

      {/* INSIGHT IA CARD */}
      <div className="bg-navy rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Zap size={100} /></div>
        <div className="relative z-10 flex items-center gap-6">
          <button 
            onClick={handlePlayAudio}
            className="w-12 h-12 rounded-full bg-white text-navy flex items-center justify-center hover:scale-105 transition-transform shrink-0 shadow-lg"
          >
            {loadingAudio ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy"></div> : <Play fill="currentColor" size={18} />}
          </button>
          <div className="flex-1">
            <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Zap size={12} /> RELATÓRIO DO COPILOT AI ({dateFilter.label.toUpperCase()})
            </h3>
            <p className="text-lg leading-relaxed font-light italic opacity-90">"{insight}"</p>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md relative ${kpi.isMain ? 'ring-1 ring-blue-500 border-blue-200' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{kpi.label}</span>
              <div className="p-2 bg-slate-50 rounded-lg">{kpi.icon}</div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-navy tracking-tight">{kpi.value}</span>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${kpi.trendNegative ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {kpi.trend} VS ANTERIOR
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FUNNEL & URGENT ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-bold text-navy uppercase tracking-widest mb-8">Funil de Atendimento no Período</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 500, fill: '#94a3b8'}} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc', radius: 4}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={35}>
                  {funnelData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="text-[10px] font-bold text-navy uppercase tracking-widest mb-6">Ações Urgentes</h3>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border-l-2 border-amber-400 rounded-r-xl">
              <h4 className="text-[10px] font-bold text-amber-900 uppercase flex items-center gap-2"><AlertTriangle size={12} /> Perda por Follow-up</h4>
              <p className="text-xs text-amber-800 mt-1 font-light">{Math.round(filteredMetrics.leadsTotais * 0.2)} pacientes sem resposta recente.</p>
            </div>
            <div className="p-4 bg-blue-50 border-l-2 border-blue-400 rounded-r-xl">
              <h4 className="text-[10px] font-bold text-blue-900 uppercase flex items-center gap-2"><Calendar size={12} /> Recalibração de Agenda</h4>
              <p className="text-xs text-blue-800 mt-1 font-light">4 horários ociosos detectados na próxima quinta-feira.</p>
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE TREND CHART */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 text-navy">
              <TrendingUp size={18} className="text-blue-500" />
              <h3 className="text-xl font-semibold tracking-tight">Tendência de Receita</h3>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Análise de crescimento e volume de faturamento</p>
          </div>
          
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 items-center">
            {[
              { id: '7d', label: '7 Dias' },
              { id: '15d', label: '15 Dias' },
              { id: '30d', label: '30 Dias' },
              { id: 'custom', label: 'Personalizado' }
            ].map((p) => (
              <button 
                key={p.id}
                onClick={() => setRevenueRange(p.id as any)}
                className={`px-4 py-2 text-[9px] font-bold uppercase rounded-xl transition-all ${revenueRange === p.id ? 'bg-white text-navy shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-navy hover:bg-white'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 400, fill: '#94a3b8' }} dy={10} />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 400, fill: '#94a3b8' }}
                tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                dx={-10}
              />
              <Tooltip 
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                labelStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* RODAPÉ DO GRÁFICO */}
        <div className="mt-8 pt-8 border-t border-slate-50 flex flex-wrap justify-between items-center gap-6">
           <div className="flex items-center gap-8 overflow-x-auto pb-2">
              <div className="flex flex-col min-w-[120px]">
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Faturamento Total</span>
                 <span className="text-xl font-bold text-navy tracking-tight">R$ {chartStats.faturamento.toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-px h-10 bg-slate-100 hidden sm:block"></div>
              <div className="flex flex-col min-w-[120px]">
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Número de Vendas</span>
                 <span className="text-xl font-bold text-navy tracking-tight">{chartStats.vendas}</span>
              </div>
              <div className="w-px h-10 bg-slate-100 hidden sm:block"></div>
              <div className="flex flex-col min-w-[120px]">
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Custo por Venda</span>
                 <span className="text-xl font-bold text-indigo-600 tracking-tight">R$ {chartStats.cpv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-px h-10 bg-slate-100 hidden sm:block"></div>
              <div className="flex flex-col min-w-[120px]">
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor Gasto</span>
                 <span className="text-xl font-bold text-rose-500 tracking-tight">R$ {chartStats.gasto.toLocaleString('pt-BR')}</span>
              </div>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 italic bg-slate-50 px-3 py-2 rounded-lg">
              <Info size={12} className="text-blue-500" /> Dados vinculados ao período selecionado.
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;