import React, { useEffect, useState } from 'react';
import { 
  X, 
  Server, 
  ShieldAlert, 
  Activity, 
  Link2, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Cpu,
  Clock,
  MapPin,
  Wifi
} from 'lucide-react';
import { fetchAssetDetail } from '../api';
import { Asset, SecurityEvent } from '../types';

interface AssetModalProps {
  assetId: string | null;
  onClose: () => void;
  onNavigateToIncident?: (incidentId: string) => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  assetId,
  onClose,
  onNavigateToIncident
}) => {
  const [data, setData] = useState<{
    asset: Asset;
    connected_assets_details: Array<{ id: string; name: string; status: string; sector: string }>;
    recent_telemetry: SecurityEvent[];
    incidents: Array<{ id: string; title: string; severity: string; status: string; risk_score: number; created_at: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!assetId) {
      setData(null);
      return;
    }
    setLoading(true);
    fetchAssetDetail(assetId)
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [assetId]);

  if (!assetId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-xl h-full bg-[#08172A] border-l border-[#203651] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#203651] flex items-center justify-between bg-[#0B1B30]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10243D] border border-[#203651] flex items-center justify-center text-[#3B82F6]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#EAF2FF]">{data?.asset.name || 'Asset Telemetry Inspector'}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#10243D] border border-[#203651] text-[#91A6C4]">
                  {assetId}
                </span>
              </div>
              <p className="text-xs text-[#91A6C4] mt-0.5">{data?.asset.sector} Sector • {data?.asset.type}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-[#10243D] hover:bg-[#132b49] text-[#91A6C4] hover:text-[#EAF2FF] border border-[#203651] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#91A6C4] space-y-3">
              <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Querying asset telemetry telemetry...</span>
            </div>
          ) : data ? (
            <>
              {/* Status and Risk Metric Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] space-y-1">
                  <div className="text-[11px] text-[#91A6C4] uppercase tracking-wider font-semibold">Operational State</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-3 h-3 rounded-full ${
                      data.asset.status === 'threat_detected' ? 'bg-[#FB7185] animate-ping' :
                      data.asset.status === 'degraded' ? 'bg-[#FBBF24]' :
                      data.asset.status === 'isolated' ? 'bg-gray-400' : 'bg-[#34D399]'
                    }`} />
                    <span className="text-sm font-bold text-[#EAF2FF] capitalize">
                      {data.asset.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#91A6C4] pt-1">
                    Criticality: <span className="text-amber-400 uppercase font-semibold">{data.asset.criticality}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] space-y-1">
                  <div className="text-[11px] text-[#91A6C4] uppercase tracking-wider font-semibold">Risk Evaluation</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-2xl font-bold font-mono ${
                      data.asset.risk_score > 60 ? 'text-[#FB7185]' :
                      data.asset.risk_score > 30 ? 'text-[#FBBF24]' : 'text-[#34D399]'
                    }`}>
                      {data.asset.risk_score}
                    </span>
                    <span className="text-xs text-[#91A6C4]">/ 100</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#10243D] h-1.5 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full ${
                        data.asset.risk_score > 60 ? 'bg-[#FB7185]' :
                        data.asset.risk_score > 30 ? 'bg-[#FBBF24]' : 'bg-[#34D399]'
                      }`}
                      style={{ width: `${Math.min(data.asset.risk_score, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] space-y-3">
                <h4 className="text-xs font-semibold text-[#EAF2FF] uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Technical & Network Parameters</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#91A6C4] block text-[11px]">Assigned IPv4</span>
                    <span className="text-[#EAF2FF] font-mono">{data.asset.ip_address}</span>
                  </div>
                  <div>
                    <span className="text-[#91A6C4] block text-[11px]">Physical Zone</span>
                    <span className="text-[#EAF2FF]">{data.asset.location}</span>
                  </div>
                  <div>
                    <span className="text-[#91A6C4] block text-[11px]">Primary Protocol</span>
                    <span className="text-[#EAF2FF] font-mono">{data.asset.metadata?.protocol || 'TCP/IP Hardened'}</span>
                  </div>
                  <div>
                    <span className="text-[#91A6C4] block text-[11px]">Last Sync Telemetry</span>
                    <span className="text-[#EAF2FF] font-mono">{new Date(data.asset.last_seen).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Connected Infrastructure Topology Nodes */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#EAF2FF] uppercase tracking-wider flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Interconnected Infrastructure Nodes</span>
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {data.connected_assets_details.map(conn => (
                    <div 
                      key={conn.id}
                      className="p-2.5 rounded-lg bg-[#0B1B30] border border-[#203651] flex items-center justify-between text-xs hover:border-[#3B82F6]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${
                          conn.status === 'threat_detected' ? 'bg-[#FB7185]' :
                          conn.status === 'degraded' ? 'bg-[#FBBF24]' : 'bg-[#34D399]'
                        }`} />
                        <span className="font-medium text-[#EAF2FF]">{conn.name}</span>
                        <span className="text-[10px] text-[#91A6C4] font-mono">({conn.id})</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#10243D] text-[#91A6C4]">
                        {conn.sector}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open Incidents on this Asset */}
              {data.incidents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-[#FB7185] uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Associated Incidents ({data.incidents.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {data.incidents.map(inc => (
                      <div 
                        key={inc.id}
                        onClick={() => onNavigateToIncident && onNavigateToIncident(inc.id)}
                        className="p-3 rounded-lg bg-[#10243D]/80 border border-rose-500/30 flex items-center justify-between hover:bg-[#10243D] cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#EAF2FF]">{inc.title}</div>
                          <div className="text-[10px] text-[#91A6C4] mt-0.5">
                            Status: <span className="text-rose-400 capitalize">{inc.status}</span> • Risk: <span className="font-mono">{inc.risk_score}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[#3B82F6]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Telemetry Stream */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#EAF2FF] uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Telemetry Event Stream</span>
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {data.recent_telemetry.map(ev => (
                    <div key={ev.id} className="p-2.5 rounded-lg bg-[#0B1B30] border border-[#203651] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#EAF2FF]">{ev.event_type}</span>
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          ev.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          ev.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                          ev.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {ev.severity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#91A6C4] font-mono">
                        <span>Dst: {ev.destination}</span>
                        <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-xs text-[#91A6C4]">Asset details unavailable</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#203651] bg-[#0B1B30] flex items-center justify-between text-xs">
          <div className="text-[11px] text-[#91A6C4]">
            Simulated Node ID: <span className="font-mono text-[#EAF2FF]">{assetId}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#10243D] hover:bg-[#132b49] text-[#EAF2FF] border border-[#203651] transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
