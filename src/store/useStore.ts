'use client';

import { create } from 'zustand';

export interface Lead {
  id: string;
  platform: string;
  source: string;
  author: string;
  content: string;
  url: string;
  postTimestamp: string;
  matchedPhrases: string; // JSON string
  score: number;
  status: string;
  notes: string;
  team: string;
  createdAt: string;
  updatedAt: string;
  outreachEvents?: OutreachEvent[];
}

export interface OutreachEvent {
  id: string;
  leadId: string;
  templateId: string | null;
  timestamp: string;
  method: string;
  notes: string;
  template?: OutreachTemplate | null;
}

export interface TriggerPhrase {
  id: string;
  text: string;
  tier: string;
  isRegex: boolean;
  isActive: boolean;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  triggerTags: string; // JSON string
  bodyText: string;
  usageCount: number;
  _count?: { outreachEvents: number };
}

export interface Stats {
  todayLeads: number;
  weekLeads: number;
  hot: number;
  warm: number;
  cold: number;
  conversionRate: number;
  mostActiveSubreddit: string;
}

interface Filters {
  platform: string;
  tier: string;
  minScore: number;
  team: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  sort: string;
}

interface AppState {
  leads: Lead[];
  phrases: TriggerPhrase[];
  templates: OutreachTemplate[];
  stats: Stats | null;
  filters: Filters;
  selectedLead: Lead | null;
  showOutreachPanel: boolean;
  activeTab: 'feed' | 'kanban' | 'templates' | 'phrases';
  alertCount: number;
  isScanning: boolean;

  setLeads: (leads: Lead[]) => void;
  setPhrases: (phrases: TriggerPhrase[]) => void;
  setTemplates: (templates: OutreachTemplate[]) => void;
  setStats: (stats: Stats) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setSelectedLead: (lead: Lead | null) => void;
  setShowOutreachPanel: (show: boolean) => void;
  setActiveTab: (tab: 'feed' | 'kanban' | 'templates' | 'phrases') => void;
  setAlertCount: (count: number) => void;
  setIsScanning: (scanning: boolean) => void;
  updateLeadStatus: (id: string, status: string) => void;
}

export const useStore = create<AppState>((set) => ({
  leads: [],
  phrases: [],
  templates: [],
  stats: null,
  filters: {
    platform: 'All',
    tier: 'All',
    minScore: 1,
    team: 'Any',
    dateFrom: '',
    dateTo: '',
    status: 'All',
    sort: 'score',
  },
  selectedLead: null,
  showOutreachPanel: false,
  activeTab: 'feed',
  alertCount: 0,
  isScanning: false,

  setLeads: (leads) => set({ leads }),
  setPhrases: (phrases) => set({ phrases }),
  setTemplates: (templates) => set({ templates }),
  setStats: (stats) => set({ stats }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setSelectedLead: (lead) => set({ selectedLead: lead }),
  setShowOutreachPanel: (show) => set({ showOutreachPanel: show }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAlertCount: (count) => set({ alertCount: count }),
  setIsScanning: (scanning) => set({ isScanning: scanning }),
  updateLeadStatus: (id, status) => set((state) => ({
    leads: state.leads.map(l => l.id === id ? { ...l, status } : l),
  })),
}));
