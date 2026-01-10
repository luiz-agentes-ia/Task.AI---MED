
import React from 'react';

export enum AppSection {
  DASHBOARD = 'dashboard',
  MARKETING = 'marketing',
  VENDAS = 'vendas',
  AGENDA = 'agenda',
  AUTOMACAO = 'automacao',
  FINANCEIRO = 'financeiro',
  INTEGRACAO = 'integracao',
  PERFIL = 'perfil'
}

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  label: string;
}

export interface MetaAdAccount {
  id: string;
  name: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
}

export interface MetaInsight {
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
}

export enum FinancialSubSection {
  OVERVIEW = 'overview',
  PAYABLE = 'payable',
  RECEIVABLE = 'receivable',
  CASHFLOW = 'cashflow'
}

export type FinancialEntryStatus = 'efetuada' | 'atrasada' | 'cancelada';
export type FinancialEntryType = 'payable' | 'receivable';

export interface FinancialEntry {
  id: string;
  date: string;
  type: FinancialEntryType;
  category: string;
  name: string;
  unitValue: number;
  discount: number;
  addition: number;
  total: number;
  status: FinancialEntryStatus;
  paymentMethod?: 'pix' | 'credit_card';
  installments?: number;
}
