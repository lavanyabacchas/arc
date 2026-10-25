import React from 'react';
import { 
  LayoutDashboard, 
  Server, 
  ShieldAlert, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  ScrollText, 
  Settings,
  Radio,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  activeThreatsCount: number;
  openIncidentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeThreatsCount,
  openIncidentsCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'infrastructure', label: 'Infrastructure', icon: Server, badge: '8 Assets' },
    { id: 'threats', label: 'Threat Detection', icon: ShieldAlert, alertBadge: activeThreatsCount > 0 ? activeThreatsCount : undefined },
    { id: 'investigations', label: 'Investigations', icon: Search, badge: openIncidentsCount > 0 ? `${openIncidentsCount} Open` : undefined },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Sparkles, highlight: true },
    { id: 'responses', label: 'Response Center', icon: ShieldCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#08172A] border-r border-[#203651] flex flex-col justify-between flex-shrink-0 select-none min-h-[calc(100vh-4rem)]">
      {/* Navigation List */}
      <div className="p-3 space-y-1">
        <div className="px-3 pt-3 pb-2 text-[10px] font-bold text-[#627D98] tracking-wider uppercase">
          Operations Command
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 shadow-sm'
                  : 'text-[#91A6C4] hover:bg-[#10243D] hover:text-[#EAF2FF] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-[#3B82F6]' : (item.highlight ? 'text-[#A78BFA]' : 'text-[#91A6C4] group-hover:text-[#EAF2FF]')
                }`} />
                <span>{item.label}</span>
              </div>

              {/* Badges */}
              {item.alertBadge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold animate-pulse">
                  {item.alertBadge}
                </span>
              )}
              {item.badge && (
                <span className="px-1.5 py-0.2 rounded bg-[#10243D] text-[#91A6C4] border border-[#203651] text-[10px]">
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="px-1.5 py-0.2 rounded bg-purple-500/15 text-[#A78BFA] border border-purple-500/20 text-[10px] font-semibold">
                  ARC-AI
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Sandbox Notice */}
      <div className="p-4 m-3 rounded-xl bg-[#0B1B30] border border-[#203651] space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#34D399]" />
          <span className="text-[11px] font-bold text-[#EAF2FF] tracking-wider uppercase">
            SIMULATION ENVIRONMENT
          </span>
        </div>
        <p className="text-[10px] text-[#91A6C4] leading-relaxed">
          Demo systems operational. Telemetry generated from synthetic critical infrastructure models.
        </p>
        <div className="pt-2 border-t border-[#203651]/60 flex items-center justify-between text-[10px] text-[#627D98]">
          <span className="flex items-center gap-1 font-mono">
            <Cpu className="w-3 h-3 text-[#3B82F6]" />
            v1.0-SOC
          </span>
          <span className="text-[#34D399]">No real grid impact</span>
        </div>
      </div>
    </aside>
  );
};
