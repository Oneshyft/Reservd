'use client';

import { useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import StatsBar from '@/components/StatsBar';
import LeadFeed from '@/components/LeadFeed';
import KanbanView from '@/components/KanbanView';
import TemplatesManager from '@/components/TemplatesManager';
import PhrasesManager from '@/components/PhrasesManager';
import OutreachPanel from '@/components/OutreachPanel';
import ManualLeadLogger from '@/components/ManualLeadLogger';
import ComplianceBanner from '@/components/ComplianceBanner';
import FacebookSearchTerms from '@/components/FacebookSearchTerms';
import TwitterSearchCard from '@/components/TwitterSearchCard';
import { Search, Bell, RefreshCw, LayoutGrid, ListFilter, FileText, Tags } from 'lucide-react';

export default function Home() {
  const {
    filters, setLeads, setPhrases, setTemplates, setStats,
    activeTab, setActiveTab, alertCount, setAlertCount,
    isScanning, setIsScanning,
  } = useStore();

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.platform !== 'All') params.set('platform', filters.platform);
    if (filters.tier !== 'All') params.set('tier', filters.tier);
    if (filters.minScore > 1) params.set('minScore', filters.minScore.toString());
    if (filters.team !== 'Any') params.set('team', filters.team);
    if (filters.status !== 'All') params.set('status', filters.status);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    params.set('sort', filters.sort);

    const res = await fetch(`/api/leads?${params}`);
    const data = await res.json();
    setLeads(data);

    // Count new hot leads for alert badge
    const newHot = data.filter((l: { score: number; status: string }) => l.score >= 8 && l.status === 'NEW').length;
    setAlertCount(newHot);
  }, [filters, setLeads, setAlertCount]);

  const fetchData = useCallback(async () => {
    const [phrasesRes, templatesRes, statsRes] = await Promise.all([
      fetch('/api/phrases'),
      fetch('/api/templates'),
      fetch('/api/stats'),
    ]);
    setPhrases(await phrasesRes.json());
    setTemplates(await templatesRes.json());
    setStats(await statsRes.json());
  }, [setPhrases, setTemplates, setStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'HIGH' }),
      });
      await fetchLeads();
      await fetchData();
    } catch {
      // Scan may fail if Reddit API not configured
    }
    setIsScanning(false);
  };

  const tabs = [
    { id: 'feed' as const, label: 'Lead Feed', icon: ListFilter },
    { id: 'kanban' as const, label: 'CRM Kanban', icon: LayoutGrid },
    { id: 'templates' as const, label: 'Templates', icon: FileText },
    { id: 'phrases' as const, label: 'Phrases', icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">SuiteSpotter</h1>
              <p className="text-xs text-gray-500">Social Listening & Sales Outreach</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ManualLeadLogger />

            <button
              onClick={handleScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Run Scan'}
            </button>

            <div className="relative">
              <Bell className="w-5 h-5 text-gray-500" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        <ComplianceBanner />
        <StatsBar />

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <LeadFeed />
            </div>
            <div className="space-y-4">
              <FacebookSearchTerms />
              <TwitterSearchCard />
            </div>
          </div>
        )}
        {activeTab === 'kanban' && <KanbanView />}
        {activeTab === 'templates' && <TemplatesManager />}
        {activeTab === 'phrases' && <PhrasesManager />}
      </main>

      <OutreachPanel />
    </div>
  );
}
