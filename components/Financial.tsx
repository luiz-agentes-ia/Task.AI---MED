
import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, 
  ArrowUpCircle, ArrowDownCircle,
  CheckCircle2, AlertCircle, XCircle, Landmark, X, Save, TrendingUp, PiggyBank,
  PieChart as PieIcon, BarChart3, Bot, ChevronRight, Target, Info, CalendarDays, Wallet,
  Calendar, Filter
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';
import { FinancialSubSection, FinancialEntry, FinancialEntryStatus } from '../types';
import { useApp } from '../App';

const INITIAL_ENTRIES: FinancialEntry[] = [
  { id: '1', date: '2024-05-15', type: 'receivable', category: 'Consulta Particular', name: 'Ricardo Oliveira', unitValue: 450, discount: 0, addition: 0, total: 450, status: 'efetuada', paymentMethod: 'pix' },
  { id: '2', date: '2024-05-14', type: 'payable', category: 'Insumos', name: 'Agulhas e Seringas Pack 100', unitValue: 120, discount: 5, addition: 0, total: 115, status: 'efetuada' },
  { id: '3', date: '2024-05-10', type: 'receivable', category: 'Procedimento Estético X', name: 'Creme Dermocosmético X', unitValue: 2400, discount: 0, addition: 0, total: 2400, status: 'atrasada', paymentMethod: 'credit_card', installments: 6 },
  { id: '4', date: '2024-05-08', type: 'payable', category: 'Marketing', name: 'Assinatura Software CRM', unitValue: 299, discount: 0, addition: 0, total: 299, status: 'efetuada' },
  { id: '5', date: '2024-05-01', type: 'payable', category: 'Colaboradores', name: 'Salário Secretária', unitValue: 2500, discount: 0, addition: 0, total: 2500, status: 'efetuada' },
  { id: '6', date: '2024-05-02', type: 'payable', category: 'Contas Fixas', name: 'Aluguel Consultório', unitValue: 2000, discount: 0, addition: 0, total: 2000, status: 'efetuada' },
];

type HistoryPeriod = 'month' | '3months' | '6months' | 'year' | 'custom';

const Financial: React.FC = () => {
  const { dateFilter, setDateFilter } = useApp();
  const [subSection, setSubSection] = useState<FinancialSubSection>(FinancialSubSection.OVERVIEW);
  const [entries, setEntries] = useState<FinancialEntry[]>(INITIAL_ENTRIES);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);

  // Estados para o filtro do gráfico de evolução
  const [chartPeriod, setChartPeriod] = useState<HistoryPeriod>('6months');
  const [customStartDate, setCustomStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState<Partial<FinancialEntry>>({
    type: 'receivable',
    category: 'Consulta Particular',
    name: '',
    unitValue: 0,
    discount: 0,
    addition: 0,
    status: 'efetuada',
    date: new Date().toISOString().split('T')[0],
  });

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = entry.date;
      return entryDate >= dateFilter.start && entryDate <= dateFilter.end;
    });
  }, [entries, dateFilter]);

  const metrics = useMemo(() => {
    const efetuadas = filteredEntries.filter(e => e.status === 'efetuada');
    const revenue = efetuadas.filter(e => e.type === 'receivable').reduce((acc, curr) => acc + curr.total, 0);
    const expenses = filteredEntries.filter(e => e.type === 'payable').reduce((acc, curr) => acc + curr.total, 0);
    const aReceber = filteredEntries.filter(e => e.type === 'receivable' && e.status !== 'efetuada').reduce((acc, curr) => acc + curr.total, 0);
    const profit = revenue - expenses;
    const roi = expenses > 0 ? ((profit / expenses) * 100).toFixed(1) : '0';
    return { revenue, expenses, profit, roi, aReceber };
  }, [filteredEntries]);

  // Geração dinâmica de dados históricos baseada no filtro
  const historyData = useMemo(() => {
    const baseRevenue = 45000;
    const baseExpense = 15000;

    if (chartPeriod === 'month') {
      return [
        { name: 'Semana 1', revenue: baseRevenue * 0.22, expenses: baseExpense * 0.25, profit: (baseRevenue * 0.22) - (baseExpense * 0.25) },
        { name: 'Semana 2', revenue: baseRevenue * 0.28, expenses: baseExpense * 0.20, profit: (baseRevenue * 0.28) - (baseExpense * 0.20) },
        { name: 'Semana 3', revenue: baseRevenue * 0.25, expenses: baseExpense * 0.30, profit: (baseRevenue * 0.25) - (baseExpense * 0.30) },
        { name: 'Semana 4', revenue: baseRevenue * 0.25, expenses: baseExpense * 0.25, profit: (baseRevenue * 0.25) - (baseExpense * 0.25) },
      ];
    }

    if (chartPeriod === '3months') {
      return [
        { name: 'Março', revenue: 38000, expenses: 12000, profit: 26000 },
        { name: 'Abril', revenue: 52000, expenses: 15000, profit: 37000 },
        { name: 'Maio', revenue: 55000, expenses: 16000, profit: 39000 },
      ];
    }

    if (chartPeriod === 'year') {
      return [
        { name: 'Jan', revenue: 42000, expenses: 14000, profit: 28000 },
        { name: 'Fev', revenue: 40000, expenses: 13500, profit: 26500 },
        { name: 'Mar', revenue: 38000, expenses: 12000, profit: 26000 },
        { name: 'Abr', revenue: 52000, expenses: 15000, profit: 37000 },
        { name: 'Mai', revenue: 55000, expenses: 16000, profit: 39000 },
        { name: 'Jun', revenue: 48000, expenses: 14000, profit: 34000 },
        { name: 'Jul', revenue: 51000, expenses: 15500, profit: 35500 },
        { name: 'Ago', revenue: 49000, expenses: 14800, profit: 34200 },
        { name: 'Set', revenue: 53000, expenses: 16200, profit: 36800 },
        { name: 'Out', revenue: 58000, expenses: 17500, profit: 40500 },
        { name: 'Nov', revenue: 62000, expenses: 18000, profit: 44000 },
        { name: 'Dez', revenue: 70000, expenses: 20000, profit: 50000 },
      ];
    }

    if (chartPeriod === 'custom') {
      // Simulação de dados para período customizado
      return [
        { name: 'Início', revenue: baseRevenue * 0.5, expenses: baseExpense * 0.5, profit: (baseRevenue - baseExpense) * 0.5 },
        { name: 'Meio', revenue: baseRevenue * 0.6, expenses: baseExpense * 0.4, profit: (baseRevenue * 0.6) - (baseExpense * 0.4) },
        { name: 'Fim', revenue: baseRevenue * 0.55, expenses: baseExpense * 0.45, profit: (baseRevenue * 0.55) - (baseExpense * 0.45) },
      ];
    }

    // Default: 6months
    return [
      { name: 'Jan', revenue: 45000, expenses: 12000, profit: 33000 },
      { name: 'Fev', revenue: 42000, expenses: 13500, profit: 28500 },
      { name: 'Mar', revenue: 38000, expenses: 12000, profit: 26000 },
      { name: 'Abr', revenue: 52000, expenses: 15000, profit: 37000 },
      { name: 'Mai', revenue: 55000, expenses: 16000, profit: 39000 },
      { name: 'Jun', revenue: 48000, expenses: 14000, profit: 34000 },
    ];
  }, [chartPeriod, customStartDate, customEndDate]);

  const cashFlowProjection = useMemo(() => {
    const past = [
      { name: 'Jan', entrada: 42000, saida: 15000, saldo: 27000, type: 'real' },
      { name: 'Fev', entrada: 38000, saida: 14000, saldo: 24000, type: 'real' },
      { name: 'Mar', entrada: 45000, saida: 16000, saldo: 29000, type: 'real' },
      { name: 'Abr', entrada: 48000, saida: 17500, saldo: 30500, type: 'real' },
      { name: 'Mai', entrada: 51000, saida: 18000, saldo: 33000, type: 'real' },
    ];
    
    const avgEntrada = past.reduce((acc, v) => acc + v.entrada, 0) / past.length;
    const avgSaida = past.reduce((acc, v) => acc + v.saida, 0) / past.length;

    const future = [
      { name: 'Jun', entrada: avgEntrada * 1.05, saida: avgSaida, saldo: (avgEntrada * 1.05) - avgSaida, type: 'proj' },
      { name: 'Jul', entrada: avgEntrada * 1.10, saida: avgSaida, saldo: (avgEntrada * 1.10) - avgSaida, type: 'proj' },
      { name: 'Ago', entrada: avgEntrada * 1.08, saida: avgSaida * 1.05, saldo: (avgEntrada * 1.08) - (avgSaida * 1.05), type: 'proj' },
      { name: 'Set', entrada: avgEntrada * 1.15, saida: avgSaida, saldo: (avgEntrada * 1.15) - avgSaida, type: 'proj' },
      { name: 'Out', entrada: avgEntrada * 1.20, saida: avgSaida * 1.10, saldo: (avgEntrada * 1.20) - (avgSaida * 1.10), type: 'proj' },
      { name: 'Nov', entrada: avgEntrada * 1.25, saida: avgSaida, saldo: (avgEntrada * 1.25) - avgSaida, type: 'proj' },
    ];

    return [...past, ...future];
  }, []);

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const total = (Number(formData.unitValue) || 0) - (Number(formData.discount) || 0) + (Number(formData.addition) || 0);
    const newEntry: FinancialEntry = { 
      ...(formData as FinancialEntry), 
      id: editingEntry?.id || Math.random().toString(36).substr(2, 9), 
      total 
    };
    
    if (editingEntry) {
      setEntries(entries.map(e => e.id === editingEntry.id ? newEntry : e));
    } else {
      setEntries([newEntry, ...entries]);
    }
    
    closeForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEntry(null);
    setFormData({
      type: 'receivable',
      category: 'Consulta Particular',
      name: '',
      unitValue: 0,
      discount: 0,
      addition: 0,
      status: 'efetuada',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const distributionData = [
    { name: 'Colaboradores', value: 2500, fill: '#94a3b8' },
    { name: 'Contas Fixas', value: 2000, fill: '#475569' },
    { name: 'Impostos', value: 800, fill: '#1e293b' },
    { name: 'Insumos', value: 120, fill: '#64748b' },
    { name: 'Marketing', value: 299, fill: '#0f172a' },
  ];

  const StatusBadge = ({ status }: { status: FinancialEntryStatus }) => {
    switch (status) {
      case 'efetuada': return <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-100">Efetuada</span>;
      case 'atrasada': return <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase border border-rose-100">Atrasada</span>;
      case 'cancelada': return <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase border border-slate-200">Cancelada</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">Gestão Financeira</h2>
          <p className="text-slate-500 text-sm italic">Controle total de entradas, saídas e fluxo de caixa.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {[
            { id: FinancialSubSection.OVERVIEW, label: 'Visão Geral' },
            { id: FinancialSubSection.PAYABLE, label: 'Contas a Pagar' },
            { id: FinancialSubSection.RECEIVABLE, label: 'Contas a Receber' },
            { id: FinancialSubSection.CASHFLOW, label: 'Caixa + Fluxo' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setSubSection(tab.id as FinancialSubSection)} 
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${subSection === tab.id ? 'bg-navy text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
            <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center"><ArrowUpCircle size={12} /></div> RECEITA BRUTA
          </div>
          <p className="text-2xl font-black text-navy leading-none">R$ {metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <span className="text-[9px] font-bold text-emerald-500 mt-2 block italic uppercase tracking-widest">Saldo Efetivado</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-rose-500 uppercase tracking-widest">
            <div className="w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center"><ArrowDownCircle size={12} /></div> GASTOS TOTAIS
          </div>
          <p className="text-2xl font-black text-rose-500 leading-none">R$ {metrics.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <span className="text-[9px] font-bold text-slate-400 mt-2 block italic uppercase tracking-widest">Saída Efetivada</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-indigo-500 uppercase tracking-widest">
             <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center"><TrendingUp size={12} /></div> ROI GLOBAL
          </div>
          <p className={`text-2xl font-black leading-none ${Number(metrics.roi) < 0 ? 'text-rose-600' : 'text-indigo-600'}`}>{metrics.roi}%</p>
          <span className="text-[9px] font-bold text-slate-400 mt-2 block italic uppercase tracking-widest">Performance</span>
        </div>

        <div className="bg-navy p-6 rounded-2xl text-white shadow-xl relative overflow-hidden ring-1 ring-white/10">
          <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-blue-400 uppercase tracking-widest relative z-10">
            <PiggyBank size={14} /> LUCRO LÍQUIDO
          </div>
          <p className="text-2xl font-black leading-none relative z-10">R$ {metrics.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <span className="text-[9px] font-bold text-emerald-400 mt-2 block italic uppercase tracking-widest relative z-10">Saldo de Caixa</span>
        </div>
      </div>

      {subSection === FinancialSubSection.OVERVIEW && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
              <h3 className="text-[11px] font-black text-navy uppercase tracking-widest mb-10">DISTRIBUIÇÃO DE GASTOS (30 DIAS)</h3>
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={distributionData} 
                      innerRadius={65} 
                      outerRadius={90} 
                      paddingAngle={4} 
                      dataKey="value"
                      stroke="none"
                    >
                      {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: 'bold' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">ANÁLISE DE LUCRATIVIDADE</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                    <div>
                      <h4 className="text-xs font-black text-emerald-800">Consulta Particular</h4>
                      <p className="text-[10px] text-emerald-600 font-bold">Ticket Médio: R$ 450</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-800">ROI: 3.2x</p>
                      <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Margem 65%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                    <div>
                      <h4 className="text-xs font-black text-amber-800">Procedimento Estético X</h4>
                      <p className="text-[10px] text-amber-600 font-bold">Ticket Médio: R$ 2.400</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-amber-800">ROI: 1.8x</p>
                      <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Margem 12% (Baixa!)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-navy p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5"><Bot size={80} /></div>
                 <div className="flex gap-4 items-start relative z-10">
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/20 shadow-xl shadow-blue-500/10">
                       <Bot size={24} />
                    </div>
                    <div className="flex-1">
                       <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">CONSELHO FINANCEIRO</h4>
                       <p className="text-sm font-medium leading-relaxed italic opacity-90 text-slate-300">
                          "O Procedimento X está consumindo muitos insumos e marketing para pouca margem líquida. Focar nas consultas particulares este mês pode aumentar seu lucro líquido em 15%."
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
               <div>
                  <h3 className="text-xl font-bold text-navy">Evolução Histórica</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Comparativo de Resultados no Período Selecionado</p>
               </div>
               
               <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <div className="px-3 py-1 flex items-center gap-1.5 border-r border-slate-200">
                    <Filter size={12} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filtrar:</span>
                  </div>
                  {[
                    { id: 'month', label: 'Este Mês' },
                    { id: '3months', label: '3 Meses' },
                    { id: '6months', label: '6 Meses' },
                    { id: 'year', label: 'No Ano' },
                    { id: 'custom', label: 'Personalizado' },
                  ].map((p) => (
                    <button 
                      key={p.id}
                      onClick={() => setChartPeriod(p.id as HistoryPeriod)}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${chartPeriod === p.id ? 'bg-navy text-white shadow-md' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}
                    >
                      {p.label}
                    </button>
                  ))}
               </div>
            </div>

            {chartPeriod === 'custom' && (
              <div className="mb-10 p-6 bg-slate-50 rounded-[30px] border border-slate-100 flex flex-wrap items-center gap-6 animate-in slide-in-from-top-4 duration-300">
                 <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-navy" />
                    <span className="text-[10px] font-black text-navy uppercase tracking-widest">Período Personalizado:</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                       <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Data Inicial</label>
                       <input 
                         type="date" 
                         value={customStartDate} 
                         onChange={(e) => setCustomStartDate(e.target.value)}
                         className="p-2.5 text-[10px] font-bold text-navy bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-navy outline-none" 
                       />
                    </div>
                    <div className="w-4 h-[1px] bg-slate-200 mt-4"></div>
                    <div className="flex flex-col gap-1">
                       <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Data Final</label>
                       <input 
                         type="date" 
                         value={customEndDate} 
                         onChange={(e) => setCustomEndDate(e.target.value)}
                         className="p-2.5 text-[10px] font-bold text-navy bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-navy outline-none" 
                       />
                    </div>
                 </div>
              </div>
            )}

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: '#f8fafc', radius: 4 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '30px' }} />
                  <Bar dataKey="revenue" name="RECEITA BRUTA" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={25} />
                  <Bar dataKey="expenses" name="GASTOS TOTAIS" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={25} />
                  <Bar dataKey="profit" name="LUCRO LÍQUIDO" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {subSection === FinancialSubSection.CASHFLOW && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-bold text-navy">Fluxo de Caixa Projetado</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Realizado vs Estimativa para os próximos 6 meses</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-navy"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Realizado</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Projetado</span></div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowProjection}>
                    <defs>
                      <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="saldo" stroke={({payload}: any) => payload?.type === 'real' ? '#0f172a' : '#60a5fa'} strokeWidth={3} fillOpacity={1} fill="url(#colorReal)" />
                    <Line type="monotone" dataKey="entrada" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="saida" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-navy p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center border border-white/5">
                <div className="absolute -right-4 -bottom-4 opacity-5"><Target size={160} /></div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="p-3 bg-blue-500 text-white rounded-2xl"><Target size={24} /></div>
                  <div>
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Capacidade de Gasto</h4>
                    <p className="text-xl font-black">R$ 15.400 /mês</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed font-medium text-slate-300 relative z-10">
                  Baseado no seu caixa atual e na média de recebíveis, você pode aumentar seus gastos fixos em até **R$ 4.200** sem comprometer a reserva de emergência de 3 meses.
                </p>
                <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                    <span>Reserva de Segurança</span>
                    <span className="text-emerald-400">Protegido</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[85%]"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">MÉTRICAS DE CAIXA</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-xs font-bold text-navy">Burn Rate Médio</span>
                      <span className="text-xs font-black text-rose-500">R$ 16.500</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-xs font-bold text-navy">Runway (Meses)</span>
                      <span className="text-xs font-black text-emerald-500">6.4 meses</span>
                   </div>
                   <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-bold text-navy">Média de Sobra</span>
                      <span className="text-xs font-black text-blue-500">R$ 29.200</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-10 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-navy uppercase tracking-widest">Detalhamento da Projeção (Próximos 6 Meses)</h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase">Mês</th>
                        <th className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Entrada Est.</th>
                        <th className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Saída Est.</th>
                        <th className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Sobra Líquida</th>
                        <th className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Status IA</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {cashFlowProjection.filter(p => p.type === 'proj').map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                           <td className="px-10 py-5 text-xs font-black text-navy">{p.name}</td>
                           <td className="px-10 py-5 text-xs font-bold text-emerald-600 text-right">R$ {p.entrada.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                           <td className="px-10 py-5 text-xs font-bold text-rose-500 text-right">R$ {p.saida.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                           <td className="px-10 py-5 text-xs font-black text-navy text-right">R$ {p.saldo.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                           <td className="px-10 py-5 text-center">
                              <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">Crescimento Est.</span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {(subSection === FinancialSubSection.PAYABLE || subSection === FinancialSubSection.RECEIVABLE) && (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black text-navy uppercase text-xs tracking-[0.2em]">
              {subSection === 'payable' ? 'CONTAS A PAGAR' : 'CONTAS A RECEBER'} NO PERÍODO
            </h3>
            <button 
              onClick={() => {
                setFormData(prev => ({ ...prev, type: subSection as any }));
                setShowForm(true);
              }} 
              className="bg-navy text-white px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-navy/20 border-2 border-navy"
            >
              <Plus size={18} strokeWidth={3} /> NOVO
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">DATA</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">NOME</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">STATUS</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">VALOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries
                  .filter(e => e.type === subSection)
                  .map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-10 py-6 text-xs font-bold text-slate-400">{entry.date}</td>
                      <td className="px-10 py-6 text-xs font-bold text-navy uppercase text-center">{entry.name}</td>
                      <td className="px-10 py-6 text-center"><StatusBadge status={entry.status} /></td>
                      <td className="px-10 py-6 text-right text-sm font-black text-navy">R$ {entry.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                {filteredEntries.filter(e => e.type === subSection).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-10 py-24 text-center text-slate-400 text-xs font-medium italic opacity-50">
                      Nenhum lançamento encontrado neste período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORMULÁRIO MODAL FUNCIONAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <form onSubmit={handleSaveEntry}>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-navy">{editingEntry ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Preencha os dados do fluxo de caixa</p>
                </div>
                <button type="button" onClick={closeForm} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={24} /></button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'receivable' })}
                      className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${formData.type === 'receivable' ? 'bg-navy text-white shadow-md' : 'text-slate-500'}`}
                    >
                      Entrada
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'payable' })}
                      className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${formData.type === 'payable' ? 'bg-navy text-white shadow-md' : 'text-slate-500'}`}
                    >
                      Saída
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</label>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</label>
                  <input type="text" required placeholder="Ex: Consulta Dr. Carlos" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-navy appearance-none">
                    <option>Consulta Particular</option>
                    <option>Procedimento Estético X</option>
                    <option>Marketing</option>
                    <option>Colaboradores</option>
                    <option>Contas Fixas</option>
                    <option>Insumos</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-navy appearance-none">
                    <option value="efetuada">Efetuada / Pago</option>
                    <option value="atrasada">Pendente / Atrasado</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Lançamento (R$)</label>
                  <input type="number" step="0.01" required value={formData.unitValue} onChange={(e) => setFormData({ ...formData, unitValue: Number(e.target.value) })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-navy focus:outline-none focus:ring-2 focus:ring-navy" />
                </div>
              </div>

              <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Total Confirmado</span>
                  <p className="text-3xl font-black text-navy">R$ {Number(formData.unitValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button type="button" onClick={closeForm} className="flex-1 md:flex-none px-8 py-4 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-200 rounded-2xl transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 md:flex-none bg-navy text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-navy/30 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <Save size={16} /> Salvar Lançamento
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financial;
