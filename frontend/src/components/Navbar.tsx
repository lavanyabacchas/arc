import React, { useState } from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  Zap, 
  Bell, 
  Search, 
  UserCheck, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface NavbarProps {
  onSimulateThreat: () => void;
  onResetDemo: () => void;
  isSimulating: boolean;
  isResetting: boolean;
  unreadCount: number;
  onNavigate: (view: string) => void;
  onSearchSelect?: (type: 'asset' | 'incident', id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSimulateThreat,
  onResetDemo,
  isSimulating,
  isResetting,
  unreadCount,
  onNavigate
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 border-b border-[#203651] bg-[#08172A]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-4">
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Stylized Angular Shield / A Logo */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
            <div className="w-full h-full bg-[#08172A] rounded-[7px] flex items-center justify-center relative overflow-hidden">
              <svg className="w-6 h-6 text-[#3B82F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
                <path d="M12 8v8" />
                <path d="M9 14l3-3 3 3" />
              </svg>
              <div className="absolute inset-0 bg-[#3B82F6]/10 animate-pulse pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider text-[#EAF2FF] font-mono">ARC</span>
              <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30 uppercase">
                SOC Core
              </span>
            </div>
            <div className="text-[11px] text-[#91A6C4] -mt-0.5 hidden sm:block">
              Critical Infrastructure Cybersecurity
            </div>
          </div>
        </div>

        {/* Environment Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#10243D] border border-[#203651] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping" />
          <span className="w-2 h-2 rounded-full bg-[#34D399] -ml-4" />
          <span className="text-[#34D399] font-medium tracking-wide">SIMULATION ENVIRONMENT</span>
          <span className="text-[#627D98]">•</span>
          <span className="text-[#91A6C4] text-[11px]">Synthetic Telemetry</span>
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
        <Search className="w-4 h-4 text-[#91A6C4] absolute left-3 pointer-events-none" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search assets (e.g. Data Center, AST-003) or threats..."
          className="w-full bg-[#0B1B30] border border-[#203651] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#EAF2FF] placeholder-[#627D98] focus:outline-none focus:border-[#3B82F6] transition-colors"
        />
        {searchQuery && (
          <div className="absolute top-10 left-0 right-0 bg-[#0B1B30] border border-[#203651] rounded-lg shadow-xl p-2 z-50 text-xs">
            <div className="text-[10px] text-[#91A6C4] uppercase px-2 py-1 font-semibold">Quick Jump</div>
            <div 
              onClick={() => { onNavigate('infrastructure'); setSearchQuery(''); }}
              className="px-2 py-1.5 hover:bg-[#10243D] rounded cursor-pointer text-[#EAF2FF] flex items-center justify-between"
            >
              <span>View Data Center (AST-003)</span>
              <span className="text-[10px] text-[#3B82F6]">Asset</span>
            </div>
            <div 
              onClick={() => { onNavigate('investigations'); setSearchQuery(''); }}
              className="px-2 py-1.5 hover:bg-[#10243D] rounded cursor-pointer text-[#EAF2FF] flex items-center justify-between"
            >
              <span>Recent Exfiltration Investigation</span>
              <span className="text-[10px] text-[#FB7185]">Incident</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions, Notifications, User */}
      <div className="flex items-center gap-3">
        {/* Live Demonstration Trigger */}
        <button
          onClick={onSimulateThreat}
          disabled={isSimulating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          title="Simulate realistic outbound telemetry spike from Data Center"
        >
          <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : 'text-rose-200'}`} />
          <span>{isSimulating ? 'Injecting Telemetry...' : 'Simulate Attack'}</span>
        </button>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#10243D] hover:bg-[#132b49] border border-[#203651] text-[#91A6C4] hover:text-[#EAF2FF] text-xs font-medium transition-all active:scale-95 cursor-pointer"
          title="Restore pristine baseline demonstration state"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-[#3B82F6]' : ''}`} />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-[#10243D] hover:bg-[#132b49] border border-[#203651] text-[#91A6C4] hover:text-[#EAF2FF] relative transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FB7185] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0B1B30] border border-[#203651] rounded-xl shadow-2xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#203651] mb-2">
                <span className="font-semibold text-[#EAF2FF]">SOC Real-Time Telemetry Feed</span>
                <span className="text-[10px] text-[#34D399]">Live Updates</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <div 
                  onClick={() => { onNavigate('threats'); setShowNotifications(false); }}
                  className="p-2 rounded bg-[#10243D]/70 hover:bg-[#10243D] border border-rose-500/30 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Outbound Anomaly Active</span>
                  </div>
                  <p className="text-[11px] text-[#91A6C4] mt-0.5">High egress burst detected on Data Center (AST-003).</p>
                </div>
                <div 
                  onClick={() => { onNavigate('investigations'); setShowNotifications(false); }}
                  className="p-2 rounded bg-[#10243D]/40 hover:bg-[#10243D] border border-[#203651] cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <Info className="w-3.5 h-3.5" />
                    <span>Failed Auth Review</span>
                  </div>
                  <p className="text-[11px] text-[#91A6C4] mt-0.5">Communication Tower SSH investigation ongoing.</p>
                </div>
              </div>
              <div 
                onClick={() => { onNavigate('threats'); setShowNotifications(false); }}
                className="mt-2 text-center text-[11px] text-[#3B82F6] hover:underline cursor-pointer pt-1 border-t border-[#203651]"
              >
                View all security telemetry →
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#203651]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border border-blue-400/40 shadow-inner">
            AM
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-[#EAF2FF] leading-tight">Alex Mercer</div>
            <div className="text-[10px] text-[#34D399] font-medium leading-tight">Lead SOC Analyst</div>
          </div>
        </div>
      </div>
    </header>
  );
};
