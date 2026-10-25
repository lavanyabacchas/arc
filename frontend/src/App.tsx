import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast, ToastMessage } from './components/Toast';
import { AssetModal } from './components/AssetModal';

import { DashboardView } from './views/DashboardView';
import { InfrastructureView } from './views/InfrastructureView';
import { ThreatDetectionView } from './views/ThreatDetectionView';
import { InvestigationsView } from './views/InvestigationsView';
import { AIAnalysisView } from './views/AIAnalysisView';
import { ResponseCenterView } from './views/ResponseCenterView';
import { AnalyticsView } from './views/AnalyticsView';
import { AuditLogsView } from './views/AuditLogsView';
import { SettingsView } from './views/SettingsView';

import { fetchDashboard, simulateThreatEvent, resetDemo } from './api';
import { DashboardData } from './types';

export function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [targetIncidentId, setTargetIncidentId] = useState<string | undefined>();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadDashboard = () => {
    fetchDashboard()
      .then(data => setDashboardData(data))
      .catch(err => {
        console.error('Failed to load dashboard:', err);
      })
      .finally(() => setLoadingDashboard(false));
  };

  useEffect(() => {
    loadDashboard();
    // Refresh interval every 8 seconds for dynamic simulated telemetry
    const interval = setInterval(loadDashboard, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateThreat = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateThreatEvent();
      showToast(
        `Critical Anomaly Detected: Abnormal outbound egress on ${res.asset_name}! Incident ${res.incident_id} opened.`,
        'warning'
      );
      loadDashboard();
      // Navigate to dashboard or investigations to show the live effect
      setCurrentView('dashboard');
    } catch (err) {
      showToast('Simulation failed to connect to backend', 'warning');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetDemo();
      showToast('Demo environment restored to baseline. All synthetic attacks cleared.', 'success');
      loadDashboard();
      setCurrentView('dashboard');
      setTargetIncidentId(undefined);
      setSelectedAssetId(null);
    } catch (err) {
      showToast('Failed to reset demo dataset', 'warning');
    } finally {
      setIsResetting(false);
    }
  };

  const handleNavigate = (view: string, targetId?: string) => {
    if (targetId) {
      setTargetIncidentId(targetId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-[#06111F] text-[#EAF2FF] flex flex-col font-sans selection:bg-[#3B82F6] selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        onSimulateThreat={handleSimulateThreat}
        onResetDemo={handleResetDemo}
        isSimulating={isSimulating}
        isResetting={isResetting}
        unreadCount={dashboardData?.kpis.high_critical_threats || 0}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => handleNavigate(view)}
          activeThreatsCount={dashboardData?.kpis.active_threats || 0}
          openIncidentsCount={dashboardData?.kpis.open_incidents || 0}
        />

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#06111F]">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              loadingDashboard && !dashboardData ? (
                <div className="py-32 flex flex-col items-center justify-center text-[#91A6C4] space-y-4">
                  <div className="w-10 h-10 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Connecting to ARC SOC Telemetry Grid...</span>
                </div>
              ) : dashboardData ? (
                <DashboardView
                  data={dashboardData}
                  onSelectNode={(nodeId) => setSelectedAssetId(nodeId)}
                  onNavigate={handleNavigate}
                />
              ) : (
                <div className="py-20 text-center text-xs text-[#91A6C4]">
                  Unable to connect to ARC SOC Backend. Please verify FastAPI backend service is running on port 8000.
                </div>
              )
            )}

            {currentView === 'infrastructure' && (
              <InfrastructureView
                onSelectAsset={(assetId) => setSelectedAssetId(assetId)}
              />
            )}

            {currentView === 'threats' && (
              <ThreatDetectionView
                onNavigateToInvestigation={(incId) => handleNavigate('investigations', incId)}
              />
            )}

            {currentView === 'investigations' && (
              <InvestigationsView
                initialIncidentId={targetIncidentId}
                onNavigateToResponse={(incId) => handleNavigate('responses', incId)}
                onShowToast={showToast}
              />
            )}

            {currentView === 'ai-analysis' && (
              <AIAnalysisView
                onNavigateToResponse={(incId) => handleNavigate('responses', incId)}
                onShowToast={showToast}
              />
            )}

            {currentView === 'responses' && (
              <ResponseCenterView
                onShowToast={showToast}
                onRefreshAll={loadDashboard}
              />
            )}

            {currentView === 'analytics' && (
              <AnalyticsView />
            )}

            {currentView === 'audit-logs' && (
              <AuditLogsView />
            )}

            {currentView === 'settings' && (
              <SettingsView
                onResetDemo={handleResetDemo}
                isResetting={isResetting}
                onShowToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Asset Inspection Modal Drawer */}
      <AssetModal
        assetId={selectedAssetId}
        onClose={() => setSelectedAssetId(null)}
        onNavigateToIncident={(incId) => {
          setSelectedAssetId(null);
          handleNavigate('investigations', incId);
        }}
      />

      {/* Action Notification Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
